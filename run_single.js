const { Builder, By, Key, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

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


async function main(domain, platform) {

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
    const chrome_result = await test_page(`http://${domain}:8081/benchmark/web_proxy.html`);

    for(const key in chrome_result) {
      console.log("chrome", key, chrome_result[key])
    }
  } finally {
    await driver.quit();
  }
};

main("localhost"); // localhost on PC
// main("140.113.193.198", "android");
