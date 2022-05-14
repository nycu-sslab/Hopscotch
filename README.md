# Hopscotch-JS

Hopscotch-JS is a manually ported JavaScript version of the [Hopscotch micro-benchmark suite](https://github.com/alifahmed/hopscotch).

Currently, Hopscotch-JS's purpose is for evaluating the performance of the shared memory (`SharedArrayBuffer`) in parallel web workers, which tests different memory access patterns in a different number of web workers used upon the proxy pattern parallelism (the main thread creates a proxy thread and the proxy thread create other worker threads). 

It's easy to modify the source code for a different purpose; for example, testing `ArrayBuffer` instead of `SharedArrayBuffer`, running the code without web workers, or not using the proxy pattern parallelism.

## Setup

### Node.js

Node.js is required. You can use NVM to install Node.js

```sh
# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# refresh shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# install Node.js
nvm install node

# check Node.js
node -v
```

### Chrome

Install chrome 91

```sh
# install chrome 91
wget http://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_91.0.4472.164-1_amd64.deb

sudo apt -y install ./google-chrome-...._amd64.deb
google-chrome-stable --version
```

Download the corresponding [Chrome Driver](https://sites.google.com/chromium.org/driver/downloads?authuser=0).

helpful reading: https://unix.stackexchange.com/questions/233185/install-older-versions-of-google-chrome-stable-on-ubuntu-14-10

## Usage

Open a web server for this project (listen on port 8081).

```sh
node tool/http_server.js
```

Install the node modules.

```sh
npm install
```

Run the benchmark.

```sh
# single run
node run_single.js

# batch run and store the output
node run_batch.js
```

## Parameters

You can modify the parameters in `benchmark/web_main_proxy.js`:

```js
{
    arr_len: 5000, // shared memory array length
    arr_num: 4,    // the amount of the shared memory arrays
    iter: 1000,    // iteration times
    thread_num: 4  // the number (<= 4) of thread used
}
```

## Citation

If you use Hopscotch-JS for an academic purpose, please cite the followings:

- Alif Ahmed and Kevin Skadron. 2019. Hopscotch: a micro-benchmark suite for memory performance evaluation. In Proceedings of the International Symposium on Memory Systems (MEMSYS '19). Association for Computing Machinery, New York, NY, USA, 167–172. https://doi.org/10.1145/3357526.3357574
- Liu, An-Chi and You, Yi-Ping, "Offworker: An Offloading Framework for Parallel Web Applications,"  M.S. thesis, Institute of Computer Science and Engineering, National Yang Ming Chiao Tung University, Hsinchu, Taiwan, 2022. [Online]. Available: https://etd.lib.nctu.edu.tw/cgi-bin/gs32/tugsweb.cgi?o=dnctucdr&s=id=%22GT0708560050%22.&switchlang=en

## License

MIT