//draw.js

// 全局变量存储所有数据
let isLayerLoaded = false;
var Mesh = [];


//颜色方案
function AssignMeshColor(rainValue, alpha) {
    let curColor = [];
    if (rainValue <= 0) curColor = new Cesium.Color(0.2, 0.6, 0.9, alpha);
    else if (rainValue <= 0.2) curColor = new Cesium.Color(0.2, 0.6, 0.9, alpha);
    else if (rainValue <= 0.5) curColor = new Cesium.Color(0.0, 0.4, 0.8, alpha);
    else if (rainValue <= 1.0) curColor = new Cesium.Color(0.8, 0.8, 0.2, alpha);
    else if (rainValue <= 2.0) curColor = new Cesium.Color(0.9, 0.5, 0.1, alpha);
    else curColor = new Cesium.Color(0.8, 0.2, 0.2, alpha);
    return curColor;
}

async function GenerateMeshColor(data) {
    try {
        const curdataArr = data.vertexs;
        const len = curdataArr.length;
        const link = data.links;
        let positions = [];
        let positions2 = [];
        let zdata = [];
        let colorArr = [];

        //从wgs转Cartesian3笛卡尔
        for (let i = 0; i < len - 2; i = i + 3) {
            var temp = Cesium.Cartesian3.fromDegrees(
                curdataArr[i],
                curdataArr[i + 1],
                curdataArr[i + 2]
                //curdataArr[i + 2] * exaggeration 
            );
            positions[i] = temp.x;
            positions[i + 1] = temp.y;
            positions[i + 2] = temp.z;
            //positions[i + 2] = temp.z * exaggeration;
        }

        for (let i = 0; i != len / 3; i++) {
            var temp = Cesium.Cartographic.fromDegrees(
                curdataArr[3 * i],
                curdataArr[3 * i + 1]
            );
            positions2[i] = temp;
        }

        //获取cesium中的高程（相对椭球面的），存放在zdata数组中
        async function queryTerrainHeight() {
            try {
                const terrainProvider = await Cesium.createWorldTerrainAsync();
                const updatedPositions = await Cesium.sampleTerrainMostDetailed(terrainProvider, positions2, true);
                for (let i = 0; i < updatedPositions.length; i++) {
                    zdata[i] = updatedPositions[i].height;
                }
                return zdata;
            } catch (error) {
                console.log(`Failed to add world imagery: ${error}`);
            }
        };
        zdata = await queryTerrainHeight();

        for (let i = 0; i != len / 3; i++) {
            var zFieldValue = curdataArr[3 * (i + 1) - 1] - zdata[i];
            var tempColor = AssignMeshColor(zFieldValue, 0.6);
            colorArr.push(tempColor.red);
            colorArr.push(tempColor.green);
            colorArr.push(tempColor.blue);
            colorArr.push(tempColor.alpha);
        }
        return { positions, link, colorArr };

    } catch (error) {
        console.error('GenerateMeshColor runs wrong:', error);
    }

}

function createMeshPrimitive(result) {

    let geometryMesh = [];
    // 构建geometry
    geometryMesh = new Cesium.Geometry({
        attributes: {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: result.positions,
            }),
            color: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 4,
                values: result.colorArr,
            }),
        },
        indices: result.link,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(result.positions),
        vertexFormat: Cesium.VertexFormat.POSITION_AND_COLOR, //注意
    });

    // 构建instance
    var instance = [];
    instance = new Cesium.GeometryInstance({
        //geometry: Cesium.GeometryPipeline.toWireframe(geometryMesh),
        geometry: geometryMesh,
        attributes: {},
    });

    // Primitive API 绘制
    var mesh = viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true,
                translucent: true,
            }),
            show: false, // 默认隐藏所有网格
            asynchronous: false // 同步加载确保立即可用
        })
    );
    Mesh.push(mesh);

    console.log(`添加网格 ${Mesh.length - 1}:`, mesh);
}

// 绘制网格
async function AddMeshPrimitive(data) {
    if (!isDataLoaded) {
        alert("请先加载数据");
        return;
    }
    console.log("draw----begin");
    const result = await GenerateMeshColor(data);
    createMeshPrimitive(result);
}


