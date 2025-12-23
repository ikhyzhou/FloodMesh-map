//file.js

// 全局变量存储所有数据
let data = [];
let isDataLoaded = false;


const filepath1 = [];
const filepath2 = [];
const f1 = "/point/vertex/";
const f2 = "/point/alpha shape/";

var range = [];

function readTextFile1(filePath) {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, true);
    xmlhttp.onload = function () {
      if (xmlhttp.status === 200) {
        const allText = xmlhttp.response;
        const vertexs = [];

        let n = 0;
        allText.split("\n").forEach(function (v, i) {
          v.split(",").forEach(function (y, j) {
            if (j !== 0 && j !== 4) {
              vertexs[n++] = y.toString();
            }
          });
        });

        resolve(vertexs); // 成功时返回结果
      } else {
        reject(new Error(`文件加载失败: ${xmlhttp.status}`));
      }
    };

    xmlhttp.onerror = function () {
      reject(new Error("网络错误"));
    };

    xmlhttp.send();
  });
}

function readTextFile2(filePath) {
  return new Promise((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, true);
    xmlhttp.onload = function () {
      if (xmlhttp.status === 200) {
        const allText = xmlhttp.response;
        const links = [];

        let n = 0;
        allText.split("\n").forEach(function (v, i) {
          v.split(",").forEach(function (y, j) {
            if (y != "" && y != "\r") links[n++] = y.toString();
          });
        });

        resolve(links); // 成功时返回结果
      } else {
        reject(new Error(`文件加载失败: ${xmlhttp.status}`));
      }
    };

    xmlhttp.onerror = function () {
      reject(new Error("网络错误"));
    };

    xmlhttp.send();
  });
}

async function loadData() {
  try {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      filepath1[i] = f1 + (i + 1).toString() + ".txt";
      filepath2[i] = f2 + (i + 1).toString() + ".txt";

      promises.push(
        Promise.all([
          readTextFile1(filepath1[i]),
          readTextFile2(filepath2[i])
        ]).then(([vertex, link]) => {
          return { vertexs: vertex, links: link };
        })
      );
    }
    const results = await Promise.all(promises);
    data.push(...results);

    console.log("data", data);
    isDataLoaded = true;

    for (let i = 0; i < 10; i++) {
      await AddMeshPrimitive(data[i]);  
    }
    isLayerLoaded = true;
    //layer();
  } catch (error) {
    console.error("错误:", error);
  }

}
