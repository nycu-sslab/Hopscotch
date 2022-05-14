const { Builder, By, Key, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const { writeFileSync } = require("fs")

const ROUND_NUM = 3;

const domain = "localhost"

let driver;


async function test_page(url) {
  await driver.get(url);

  const flagElem = await driver.findElement(By.id('flag'));

  await driver.wait(until.elementTextContains(flagElem, "done"), 100000);

  var output = {
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

  for (const key of Object.keys(output)) {
    const elem = await driver.findElement(By.id(key));
    let content = await elem.getText();
    arr = JSON.parse("[" + content + "]");

    output[key] = arr;
  }

  return output;
}

function data_process(results_c) {

  let output = {};

  for (const key of Object.keys(results_c[0])) {
    if (key != "empty") {
      let obj = { thread1: {}, thread2: {}, thread3: {}, thread4: {} };
      for (let thread = 1; thread <= 4; thread++) {
        let avg = 0, std, V_sum = 0, val;
        for (let i = 0; i < results_c.length; i++) {
          // eliminate the bias (empty)
          val = (results_c[i][key][thread] - results_c[i]["empty"][thread]);
          avg += val;
          V_sum += val * val;
        }
        avg /= ROUND_NUM;
        std = Math.sqrt(V_sum / ROUND_NUM - avg * avg);

        const tid = "thread" + thread;
        obj[tid]["avg"] = avg;
        obj[tid]["std"] = std;
      }
      output[key] = obj;
    }
  }

  return output;
}

async function collect_data() {
  const results_c = [];

  for (let round = 0; round < ROUND_NUM; round++) {
    console.log("round: ", round);
    console.log("running chrome")
    const chrome_result = await test_page(`http://${domain}:8081/benchmark/web_proxy.html`);

    await wait(10)
    results_c.push(chrome_result);
  }

  return data_process(results_c);
}



async function main(platform) {

  let options;

  if (platform == "android") {
    options = new Options().androidChrome()
  } else {
    options = new Options().addArguments("--headless")
  }

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {

    const result = await collect_data();

    writeFileSync("output.json", JSON.stringify(result));
  } finally {
    await driver.quit();
  }
};

async function wait() {
  await new Promise(resolve => setTimeout(resolve, 10));
  return;
}

main(); // localhost on PC
// main("android");
