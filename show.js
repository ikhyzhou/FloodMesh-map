//show.js

// 时间轴相关变量
var currentLayer = 1;
var isPlaying = false;
var playbackInterval;
var playbackSpeed = 500; // 毫秒

function showSelectedLayer() {
    if (!isLayerLoaded) return;

    // 获取输入框的值，并转换为整数
    var numElement = document.getElementById("layerInput");
    var num = parseInt(numElement.value);

    console.log("输入框的值:", numElement.value);

    // 验证输入
    if (isNaN(num) || num < 1 || num > data.length) {
        //console.log(`请输入 1-${data.length} 之间的数字`);
        //return;
        num = 1;
    }

    showLayer(num);
}

function showLayer(layerNumber) {
    if (!isLayerLoaded) {
        console.log("图层未加载");
        return;
    }
    const layerIndex = layerNumber - 1;

    if (layerIndex < 0 || layerIndex >= Mesh.length) {
        console.error("无效的图层编号");
        return;
    }
    console.log(`显示图层 ${layerNumber}`);

    // 设置所有图层显示状态
    for (let i = 0; i < Mesh.length; i++) {
        if (Mesh[i]) {
            Mesh[i].show = (i === layerIndex);
        }
    }

    // 更新当前图层
    currentLayer = layerNumber;
    // 更新输入框
    document.getElementById("layerInput").value = layerNumber;
    // 更新时间轴滑块
    document.getElementById("timelineSlider").value = layerNumber;
    // 更新当前时间标签
    document.getElementById("currentTimeLabel").textContent = `图层 ${layerNumber}`;
    // 强制刷新

    viewer.scene.requestRender();
    console.log(Mesh[layerIndex]);
}



// 时间轴功能
function initTimelineEvents() {
    const slider = document.getElementById("timelineSlider");

    // 滑块拖动事件
    slider.addEventListener("input", function () {
        const layerNumber = parseInt(this.value);
        showLayer(layerNumber);
    });

    // 滑块释放事件（确保最终值正确）
    slider.addEventListener("change", function () {
        const layerNumber = parseInt(this.value);
        showLayer(layerNumber);
    });
}

function togglePlayPause() {
    const playPauseBtn = document.getElementById("playPauseBtn");

    if (isPlaying) {
        // 停止播放
        clearInterval(playbackInterval);
        playPauseBtn.textContent = "▶ 播放";
        document.getElementById("prevBtn").disabled = false;
        document.getElementById("nextBtn").disabled = false;
    } else {
        // 开始播放
        playPauseBtn.textContent = "⏸ 暂停";
        document.getElementById("prevBtn").disabled = true;
        document.getElementById("nextBtn").disabled = true;

        playbackInterval = setInterval(() => {
            if (currentLayer < 10) {
                showLayer(currentLayer + 1);
            } else {
                // 播放到最后一帧时停止
                togglePlayPause();
                showLayer(1); // 回到第一帧
            }
        }, playbackSpeed);
    }

    isPlaying = !isPlaying;
}

function previousLayer() {
    if (currentLayer > 1) {
        showLayer(currentLayer - 1);
    }
}

function nextLayer() {
    if (currentLayer < 10) {
        showLayer(currentLayer + 1);
    }
}

// 添加输入框实时响应
document.addEventListener('DOMContentLoaded', function () {
    const inputElement = document.getElementById("layerInput");
    if (inputElement) {
        inputElement.addEventListener("input", function () {
            if (isLayerLoaded1) {
                const num = parseInt(this.value);
                if (!isNaN(num) && num >= 1 && num <= 10) {
                    showLayer(num);
                }
            }
        });
    }
});

