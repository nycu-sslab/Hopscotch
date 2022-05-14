"use strict"

var shms, shm_B, thread_num, thread_id, arr_len, arr_num;

addEventListener('message', function (e) {
    const data = e.data;

    if (data.msg == "start") {

        shms = data.shms;
        thread_id = data.thread_id;
        arr_len = data.arr_len;
        arr_num = data.arr_num;
        shm_B = data.shm_B;

        postMessage({
            msg: "done",
        });
    } else if (data.msg == "kernel") {

        thread_num = data.thread_num;

        const time_marker = performance.now();

        kernels[data.kernel_name].apply(undefined, []);

        const run_time = performance.now() - time_marker;

        postMessage({
            msg: "done1",
            run_time,
        });
    }
});


var kernels = {
    empty: function () {
        return;
    },
    r_seq_ind: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 0;

        for (let i = start; i <= end; i++) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                a = shms[arr_id][i];
            }
        }
        return a;
    },
    r_seq_reduce: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 0;

        for (let i = start; i <= end; i++) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                a += shms[arr_id][i];
            }
        }
        return a;
    },
    r_rand_ind: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 0;

        let rand_dis = [1, 2, 4, 7, 5, 1, 5]; // just magic numbers
        let cnt = 0;
        for (let i = start; i <= end; i += rand_dis[cnt++ % rand_dis.length]) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                a = shms[arr_id][i];
            }
        }
        return a;
    },
    r_stride_k: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 0;

        let k = 4;
        for (let i = start; i <= end; i += k) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                a = shms[arr_id][i];
            }
        }
        return a;
    },
    r_tile: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 0;

        let k = 8;
        let l = 3;
        for (let i = start; i <= end; i += k) {
            for (let j = i; j <= i + l; j++) {
                for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                    a = shms[arr_id][j];
                }
            }
        }
        return a;
    },
    w_seq_fill: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 1.23;

        for (let i = start; i <= end; i++) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                shms[arr_id][i] = a;
            }
        }
    },
    w_rand_ind: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 2.364;

        let rand_dis = [1, 2, 4, 7, 5, 1, 5]; // just magic numbers
        let cnt = 0;
        for (let i = start; i <= end; i += rand_dis[cnt++ % rand_dis.length]) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                shms[arr_id][i] = a;
            }
        }
    },
    w_stride_k: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 3.1415;

        let k = 4;
        for (let i = start; i <= end; i += k) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                shms[arr_id][i] = a;
            }
        }
    },
    w_tile: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 5.5636;

        let k = 8;
        let l = 3;
        for (let i = start; i <= end; i += k) {
            for (let j = i; j <= i + l; j++) {
                for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                    shms[arr_id][j] = a;
                }
            }
        }
    },
    rw_seq_inc: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let a = 4.1113;

        for (let i = start; i <= end; i++) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                shms[arr_id][i] += a;
            }
        }
    },
    rw_gather: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let rand_dis = [1, 3, 4, 7, 2, 1, 5, 1, 1, 2]; // just magic numbers
        let cnt = 0;

        for (let i = start; i <= end; i++) {
            const idx = (cnt + rand_dis[i % rand_dis.length]) % arr_len;
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                shms[arr_id][i] = shm_B[idx];
            }
        }
    },
    rw_scatter: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let rand_dis = [1, 2, 1, 3, 3, 4, 7, 5, 1, 5]; // just magic numbers
        let cnt = 0;
        for (let i = start; i <= end; i += rand_dis[cnt++ % rand_dis.length]) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                shms[arr_id][i] = shm_B[cnt];
            }
        }
    },
    rw_scatter_gather: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let rand_dis = [1, 2, 1, 3, 3, 4, 7, 5, 1, 5]; // just magic numbers
        let cnt = 0;
        for (let i = start; i <= end; i += rand_dis[cnt++ % rand_dis.length]) {
            for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                shms[arr_id][i] = shm_B[i];
            }
        }
    },
    rw_tile: function () {
        const thread_per_chunk = (arr_len / thread_num) | 0;

        var start = thread_per_chunk * thread_id == 0 ? 1 : thread_per_chunk * thread_id;

        var end = thread_id == thread_num - 1 ? arr_len : thread_per_chunk * (thread_id + 1);

        let k = 8;
        let l = 3;
        for (let i = start; i <= end; i += k) {
            for (let j = i; j <= i + l; j++) {
                for (let arr_id = 0; arr_id < arr_num; arr_id++) {
                    shms[arr_id][j] = shm_B[j];
                }
            }
        }
    },
}
