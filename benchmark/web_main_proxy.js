var _iter, _arr_len, _arr_num, _thread_num = 4;

var kernels = {
    empty: null,
    r_seq_ind: null,
    r_seq_reduce: null,
    r_rand_ind: null,
    r_stride_k: null,
    r_tile: null,
    w_seq_fill: null,
    w_rand_ind: null,
    w_stride_k: null,
    w_tile: null,
    rw_seq_inc: null,
    rw_gather: null,
    rw_scatter: null,
    rw_scatter_gather: null,
    rw_tile: null,
}

var barrier_buf = new SharedArrayBuffer(1 * Int8Array.BYTES_PER_ELEMENT);
var barrier = new Int8Array(barrier_buf);

addEventListener('message', async function (e) {
    await main({
        arr_len: 5000,
        arr_num: 4,
        iter: 1000,
        thread_num: 4
    })


    postMessage({
        "done": true,
        kernels
    })
}, false);

async function init_workers(thread_num, params) {
    return new Promise((resolve, reject) => {
        function handleWorker(thread_id) {
            return new Promise((resolve, reject) => {
                // create worker, do stuff
                const worker = new Worker("web_worker.js");

                params["thread_id"] = thread_id;
                worker.postMessage(params);

                worker.onmessage = function (e) {
                    resolve(worker);
                }
                worker.onerror = function (err) {
                    reject(err)
                }

            })
        }

        var workers = [];

        for (var i = 0; i < thread_num; i++) {
            workers.push(handleWorker(i))
        }

        Promise.all(workers)
            .then(res => {
                console.log("all workers started")
                resolve(res);
            })
            // handle error
            .catch(err => {
                reject(err)
            });
    });
}

////////////////////////////////////////////////////////////////////////////////
// Main Program
////////////////////////////////////////////////////////////////////////////////
async function main(args) {

    _iter = args.iter;
    _arr_len = args.arr_len;
    _arr_num = args.arr_num;
    _thread_num = args.thread_num;

    var shm_bufs = [];
    var shms = [];

    for (let i = 0; i < _arr_num; i++) {
        shm_bufs[i] = new SharedArrayBuffer((_arr_len + 1) * Float64Array.BYTES_PER_ELEMENT);
        shms[i] = new Float64Array(shm_bufs[i]);
        for (let j = 0; j <= _arr_len; j++) {
            shms[i][j] = 1;
        }
    }

    const shm_buf_B = new SharedArrayBuffer((_arr_len + 1) * Float64Array.BYTES_PER_ELEMENT);
    const shm_B = new Float64Array(shm_buf_B);
    for (let j = 0; j <= _arr_len; j++) {
        shm_B[j] = 3.333;
    }

    workers = await init_workers(_thread_num, {
        msg: "start",
        shms: shms,
        shm_B: shm_B,
        arr_len: _arr_len,
        arr_num: _arr_num,
    });

    for (const kernel_name in kernels) {
        kernels[kernel_name] = await run_kernel(kernel_name);
    }

}

async function run_kernel(kernel_name) {
    const result = [0, 0, 0, 0, 0]; // consider only 4 threads

    for (let thread = 1; thread <= _thread_num; thread++) {

        let inner_worker_running_time = 0;
        let outer_worker_running_time = 0;

        const compute_time_marker = performance.now();

        for (let i = 0; i < _iter; i++) {

            await new Promise((resolve, reject) => {
                const time_marker = performance.now();

                Atomics.store(barrier, 0, 0)

                for (let i = 0; i < thread; i++) {
                    workers[i].onmessage = function (e) {
                        e = e.data;
                        inner_worker_running_time += e.run_time;
                        outer_worker_running_time += performance.now() - time_marker;

                        if (e.msg == "done1") {
                            Atomics.add(barrier, 0, 1);

                            if (Atomics.load(barrier, 0) == thread) {
                                resolve();
                            }
                        }
                    };

                    workers[i].postMessage({
                        msg: "kernel",
                        kernel_name,
                        thread_num: thread,
                    });
                }
            });
        }

        const compute_time = performance.now() - compute_time_marker;
        const msg_time = (outer_worker_running_time - inner_worker_running_time) / thread;
        const kernel_time = compute_time - msg_time;

        result[thread] = kernel_time;
    }

    return result;
}