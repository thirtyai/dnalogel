import * as React from 'react';
import {
    unsafe__useFiveInstance,
    useFiveEventCallback,
    useFiveModelReadyState,
    useFiveState
} from "@realsee/five/react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { Five, Mode } from "@realsee/five";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import * as THREE from "three";
import ReactDOM from 'react-dom';

interface PluginShowPropTypes {

}

const CustomConpment = () => {
    const [show, setShow] = React.useState(true)

    React.useEffect(() => {
        console.log('CustomConpment mounted')
    }, [])

    return (
        <div>
            <div> 我是标题 </div>
            {show && <div> 我是能隐藏的文字 </div>}
                <button
                    onClick={(ev) => {
                    ev.stopPropagation()
                    setShow(!show)
                    }}
                >
                    点击我{show ? '隐藏' : '展示'}文字
                </button>
        </div>
    )
}


const PluginShow = (props: PluginShowPropTypes) => {
    const [fiveState, setFiveState] = useFiveState()
    const five = unsafe__useFiveInstance()
    const fiveModeReadyState = useFiveModelReadyState()
    const [labelType, setLabelType] = React.useState<number>(1)
    const itemLabels = [
        {
            "item_labels": [
                // {
                //     "__type": "Item",
                //     "materials": null,
                //     "library": 6219,
                //     "adsorption": null,
                //     "position": [
                //         7.04986,
                //         -1.1e-05,
                //         2.898
                //     ],
                //     "quaternion": [
                //         0,
                //         0.707106,
                //         0,
                //         -0.707107
                //     ],
                //     "size": [
                //         0.37002,
                //         0.70497,
                //         0.68223
                //     ],
                //     "matrix": [
                //         0,
                //         0,
                //         0.01,
                //         0,
                //         0,
                //         0.009999,
                //         0,
                //         0,
                //         -0.01,
                //         0,
                //         0,
                //         0,
                //         7.04986,
                //         -1.1e-05,
                //         2.898,
                //         1
                //     ],
                //     "matrixWorld": [
                //         0,
                //         0,
                //         0.01,
                //         0,
                //         0,
                //         0.009999,
                //         0,
                //         0,
                //         -0.01,
                //         0,
                //         0,
                //         0,
                //         7.04986,
                //         -1.1e-05,
                //         2.898,
                //         1
                //     ],
                //     "name": "\u79d1\u52d2\u5750\u4fbf\u5668",
                //     "type": [
                //         "kitchen_bathroom",
                //         "bathroom",
                //         "toilet_bowl"
                //     ],
                //     "path": "b080ac6fda0d9f41feb031e661f845d4",
                //     "center": [
                //         0,
                //         35.249948,
                //         -0.002501
                //     ],
                //     "id": "u-RLv26eKv9Q7hww",
                //     "roomName": "\u536b\u751f\u95f4"
                // },
                // {
                //     "__type": "Item",
                //     "materials": null,
                //     "library": 16168,
                //     "adsorption": null,
                //     "position": [
                //         -0.27031,
                //         0.114995,
                //         0.022798
                //     ],
                //     "quaternion": [
                //         0,
                //         0,
                //         0,
                //         1
                //     ],
                //     "size": [
                //         0.1,
                //         0.11,
                //         0.1
                //     ],
                //     "matrix": [
                //         0.01,
                //         0,
                //         0,
                //         0,
                //         0,
                //         0.01,
                //         0,
                //         0,
                //         0,
                //         0,
                //         0.01,
                //         0,
                //         -0.27031,
                //         0.114995,
                //         0.022798,
                //         1
                //     ],
                //     "matrixWorld": [
                //         0,
                //         0,
                //         0.01,
                //         0,
                //         0,
                //         0.01,
                //         0,
                //         0,
                //         -0.010001,
                //         0,
                //         0,
                //         0,
                //         2.595872,
                //         0.750256,
                //         3.598606,
                //         1
                //     ],
                //     "name": "\u5bc6\u5c01\u7f50",
                //     "type": [
                //         "home_decoration",
                //         "tableware",
                //         "kitchen_supplies",
                //         "kitchen_supplies_4"
                //     ],
                //     "path": "3c71d16ca42204a69f5e68bc361b3d2b",
                //     "center": [
                //         0,
                //         5.5,
                //         0
                //     ],
                //     "id": "u-0dYGcukV9q7L58",
                //     "roomName": "\u5ba2\u5385"
                // },
                // {
                //     "__type": "Item",
                //     "materials": null,
                //     "library": 36999,
                //     "adsorption": null,
                //     "position": [
                //         5.364,
                //         2.7,
                //         9.090005
                //     ],
                //     "quaternion": [
                //         0,
                //         1,
                //         0,
                //         0
                //     ],
                //     "size": [
                //         2.393999,
                //         0.19999,
                //         0.19999
                //     ],
                //     "matrix": [
                //         -0.01596,
                //         0,
                //         0,
                //         0,
                //         0,
                //         0.009999,
                //         0,
                //         0,
                //         0,
                //         0,
                //         -0.01,
                //         0,
                //         5.364,
                //         2.7,
                //         9.090005,
                //         1
                //     ],
                //     "matrixWorld": [
                //         -0.01596,
                //         0,
                //         0,
                //         0,
                //         0,
                //         0.009999,
                //         0,
                //         0,
                //         0,
                //         0,
                //         -0.01,
                //         0,
                //         5.364,
                //         2.7,
                //         9.090005,
                //         1
                //     ],
                //     "name": "rs_clh_1500_yi",
                //     "type": [
                //         "home_decoration",
                //         "cloth_soft_decoration",
                //         "curtain",
                //         "curtain_others"
                //     ],
                //     "path": "b7262274e115bf403aef98d1775d417d",
                //     "center": [
                //         -0.00105,
                //         -10,
                //         0
                //     ],
                //     "id": "u-QC08DFKv9q7jbE",
                //     "roomName": "\u5367\u5ba4A"
                // },
                // {
                //     "__type": "Item",
                //     "materials": null,
                //     "library": 513,
                //     "adsorption": null,
                //     "position": [
                //         0.779995,
                //         2.45,
                //         0.65229
                //     ],
                //     "quaternion": [
                //         0,
                //         1,
                //         0,
                //         0
                //     ],
                //     "size": [
                //         0.19209,
                //         0.0259,
                //         0.19171
                //     ],
                //     "matrix": [
                //         -0.010001,
                //         0,
                //         0,
                //         0,
                //         0,
                //         0.009997,
                //         0,
                //         0,
                //         0,
                //         0,
                //         -0.01,
                //         0,
                //         0.779995,
                //         2.45,
                //         0.65229,
                //         1
                //     ],
                //     "matrixWorld": [
                //         -0.010001,
                //         0,
                //         0,
                //         0,
                //         0,
                //         0.009997,
                //         0,
                //         0,
                //         0,
                //         0,
                //         -0.01,
                //         0,
                //         0.779995,
                //         2.45,
                //         0.65229,
                //         1
                //     ],
                //     "name": "\u5438\u9876\u706f-513",
                //     "type": [
                //         "lighting",
                //         "dome_light",
                //         "spotlight",
                //         "spotlight_4"
                //     ],
                //     "path": "461f5d1e61415e4fe0be81af8ee11aaa",
                //     "center": [
                //         0,
                //         -1.295301,
                //         0
                //     ],
                //     "id": "u-ed42adc1-a663-4a4f-9a45-4cc26947f094",
                //     "roomName": "\u5ba2\u5385"
                // },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 6219,
                    "adsorption": null,
                    "position": [
                        7.04986,
                        -1.1e-05,
                        2.898
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        -0.707107
                    ],
                    "size": [
                        0.37002,
                        0.70497,
                        0.68223
                    ],
                    "matrix": [
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        -0.01,
                        0,
                        0,
                        0,
                        7.04986,
                        -1.1e-05,
                        2.898,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        -0.01,
                        0,
                        0,
                        0,
                        7.04986,
                        -1.1e-05,
                        2.898,
                        1
                    ],
                    "name": "\u79d1\u52d2\u5750\u4fbf\u5668",
                    "type": [
                        "kitchen_bathroom",
                        "bathroom",
                        "toilet_bowl"
                    ],
                    "path": "b080ac6fda0d9f41feb031e661f845d4",
                    "center": [
                        0,
                        35.249948,
                        -0.002501
                    ],
                    "id": "u-RLv26eKv9Q7hww",
                    "roomName": "\u536b\u751f\u95f4"
                },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 41557,
                    "adsorption": null,
                    "position": [
                        -1.096521,
                        0.89,
                        -1.393528
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        0.707106
                    ],
                    "size": [
                        1.02897,
                        0.65043,
                        0.09948
                    ],
                    "matrix": [
                        0,
                        0,
                        -0.01,
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        0.009998,
                        0,
                        0,
                        0,
                        -1.096521,
                        0.89,
                        -1.393528,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        -0.01,
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        0.009998,
                        0,
                        0,
                        0,
                        -1.096521,
                        0.89,
                        -1.393528,
                        1
                    ],
                    "name": "\u53a8\u623f\u6302\u4ef6 1/2#193",
                    "type": [
                        "kitchen_bathroom",
                        "kitchen",
                        "kitchen_accessories",
                        "kitchen_pendant"
                    ],
                    "path": "e7849bfe3812e5ac95abed7169ce69d8",
                    "center": [
                        -0.081099,
                        32.521549,
                        -0.07445
                    ],
                    "id": "u-XlNc5ekV9Q7i5O",
                    "roomName": "\u53a8\u623f"
                },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 32779,
                    "adsorption": null,
                    "position": [
                        -0.00268,
                        0.85,
                        -2.80151
                    ],
                    "quaternion": [
                        0,
                        0,
                        0,
                        1
                    ],
                    "size": [
                        0.33419,
                        0.263,
                        0.23099
                    ],
                    "matrix": [
                        0.009999,
                        0,
                        0,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0,
                        0,
                        0.009999,
                        0,
                        -0.00268,
                        0.85,
                        -2.80151,
                        1
                    ],
                    "matrixWorld": [
                        0.009999,
                        0,
                        0,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0,
                        0,
                        0.009999,
                        0,
                        -0.00268,
                        0.85,
                        -2.80151,
                        1
                    ],
                    "name": "\u9762\u5305\u673a18#168",
                    "type": [
                        "appliance",
                        "kitchen_appliance",
                        "kitchen_electron"
                    ],
                    "path": "0a81d72e4c047395683c59563cab71ea",
                    "center": [
                        0,
                        13.149999,
                        0
                    ],
                    "id": "u-St688VKv9Q7iAj",
                    "roomName": "\u53a8\u623f"
                },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 737,
                    "adsorption": null,
                    "position": [
                        0.603225,
                        0.81976,
                        2.645004
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        0.707106
                    ],
                    "size": [
                        0.50287,
                        1.16044,
                        0.04771
                    ],
                    "matrix": [
                        0,
                        0,
                        -0.01,
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        0.009998,
                        0,
                        0,
                        0,
                        0.603225,
                        0.81976,
                        2.645004,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        -0.01,
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        0.009998,
                        0,
                        0,
                        0,
                        0.603225,
                        0.81976,
                        2.645004,
                        1
                    ],
                    "name": "cj_hr_lha_lhb0144010_001",
                    "type": [
                        "home_decoration",
                        "mirror",
                        "dressing_mirror"
                    ],
                    "path": "77cb1efdd44f6a921a252d98dc408beb",
                    "center": [
                        0,
                        58.02435,
                        0
                    ],
                    "id": "u-5kszSekV9Q7Ib4",
                    "roomName": "\u5ba2\u5385"
                },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 1994,
                    "adsorption": null,
                    "position": [
                        4.511845,
                        0.918291,
                        0.518683
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        -0.707107
                    ],
                    "size": [
                        1.357,
                        0.771988,
                        0.03151
                    ],
                    "matrix": [
                        0,
                        0,
                        0.009502,
                        0,
                        0,
                        0.009502,
                        0,
                        0,
                        -0.009503,
                        0,
                        0,
                        0,
                        4.511845,
                        0.918291,
                        0.518683,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        0.009502,
                        0,
                        0,
                        0.009502,
                        0,
                        0,
                        -0.009503,
                        0,
                        0,
                        0,
                        4.511845,
                        0.918291,
                        0.518683,
                        1
                    ],
                    "name": "\u7535\u89c6",
                    "type": [
                        "appliance",
                        "electric_appliance",
                        "television",
                        "television_2"
                    ],
                    "path": "9bee8e8a9fe8a41ba272aab89070ff30",
                    "center": [
                        0,
                        40.640001,
                        0
                    ],
                    "id": "u-q806t7Kv9q7iFi",
                    "roomName": "\u5ba2\u5385"
                },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 36229,
                    "adsorption": null,
                    "position": [
                        4.277453,
                        0.415436,
                        1.321097
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        -0.707107
                    ],
                    "size": [
                        0.44492,
                        0.118765,
                        0.270905
                    ],
                    "matrix": [
                        0,
                        0,
                        0.016178,
                        0,
                        0,
                        0.01344,
                        0,
                        0,
                        -0.013272,
                        0,
                        0,
                        0,
                        4.277453,
                        0.415436,
                        1.321097,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        0.016178,
                        0,
                        0,
                        0.01344,
                        0,
                        0,
                        -0.013272,
                        0,
                        0,
                        0,
                        4.277453,
                        0.415436,
                        1.321097,
                        1
                    ],
                    "name": "\u5e73\u653e\u4e66 20#280",
                    "type": [
                        "home_decoration",
                        "literary_form",
                        "cultural_and_educational_books",
                        "book_lying_flat"
                    ],
                    "path": "3b6aebab11594f12f6962806dd52d6a8",
                    "center": [
                        0.93635,
                        4.41855,
                        0.3866
                    ],
                    "id": "u-gI1X8Vkv9q7iFZ",
                    "roomName": "\u5ba2\u5385"
                },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 35508,
                    "adsorption": null,
                    "position": [
                        7.102287,
                        0.962433,
                        5.42086
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        -0.707107
                    ],
                    "size": [
                        0.304172,
                        0.224605,
                        0.269108
                    ],
                    "matrix": [
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        -0.01,
                        0,
                        0,
                        0,
                        7.102287,
                        0.962433,
                        5.42086,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        0.009999,
                        0,
                        0,
                        -0.01,
                        0,
                        0,
                        0,
                        7.102287,
                        0.962433,
                        5.42086,
                        1
                    ],
                    "name": "\u62bd\u8c61\u6446\u4ef6 20#033",
                    "type": [
                        "home_decoration",
                        "tableware",
                        "tableware_others",
                        "abstract_ornaments"
                    ],
                    "path": "cb11387ad48bd3590983f9a5f778cde0",
                    "center": [
                        0,
                        11.230344,
                        0
                    ],
                    "id": "u-j467RkKv9Q7iP5",
                    "roomName": "\u5367\u5ba4A"
                },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 24331,
                    "adsorption": null,
                    "position": [
                        7.022253,
                        1.250898,
                        5.465582
                    ],
                    "quaternion": [
                        0.054267,
                        0.779522,
                        0.0682,
                        -0.620282
                    ],
                    "size": [
                        0.190451,
                        0.235139,
                        0.038999
                    ],
                    "matrix": [
                        -0.001702,
                        -1e-06,
                        0.007381,
                        0,
                        0.001281,
                        0.00746,
                        0.000295,
                        0,
                        -0.00727,
                        0.001315,
                        -0.001676,
                        0,
                        7.022253,
                        1.250898,
                        5.465582,
                        1
                    ],
                    "matrixWorld": [
                        -0.001702,
                        -1e-06,
                        0.007381,
                        0,
                        0.001281,
                        0.00746,
                        0.000295,
                        0,
                        -0.00727,
                        0.001315,
                        -0.001676,
                        0,
                        7.022253,
                        1.250898,
                        5.465582,
                        1
                    ],
                    "name": "\u76f8\u6846",
                    "type": [
                        "home_decoration",
                        "tableware",
                        "tableware_others",
                        "photo_frame"
                    ],
                    "path": "30bcbc12d7024f4648f15faa96e086d6",
                    "center": [
                        0,
                        15.519849,
                        0
                    ],
                    "id": "u-M36Pt3KV9Q7iRh",
                    "roomName": "\u5367\u5ba4A"
                },
                {
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 3338,
                    "adsorption": null,
                    "position": [
                        4.289206,
                        0.55291,
                        8.441922
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        0.707106
                    ],
                    "size": [
                        0.169855,
                        0.243295,
                        0.176824
                    ],
                    "matrix": [
                        0,
                        0,
                        -0.010001,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0,
                        4.289206,
                        0.55291,
                        8.441922,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        -0.010001,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0,
                        4.289206,
                        0.55291,
                        8.441922,
                        1
                    ],
                    "name": "\u4ed9\u4eba\u638c",
                    "type": [
                        "home_decoration",
                        "plants",
                        "green_plants",
                        "desktop_green_plant"
                    ],
                    "path": "f0c2824c389f185b0080a5db3f2cbbb3",
                    "center": [
                        -0.0006,
                        12.169499,
                        -0.017851
                    ],
                    "id": "u-kzS6ickV9Q7iZB",
                    "roomName": "\u5367\u5ba4A"
                },
            ]
        },
        {
            "item_labels": [
                {
                    "panoIndex": 0,
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 53062,
                    "adsorption": null,
                    "position": [
                        6.133254,
                        -2e-05,
                        3.64173
                    ],
                    "quaternion": [
                        0,
                        1,
                        0,
                        0
                    ],
                    "size": [
                        0.59951,
                        0.84969,
                        0.65004
                    ],
                    "matrix": [
                        -0.01,
                        0,
                        0,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0,
                        0,
                        -0.01,
                        0,
                        6.133254,
                        -2e-05,
                        3.64173,
                        1
                    ],
                    "matrixWorld": [
                        -0.01,
                        0,
                        0,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0,
                        0,
                        -0.01,
                        0,
                        6.133254,
                        -2e-05,
                        3.64173,
                        1
                    ],
                    "name": "作为 VR 空间重构领域的领导者，如视为全行业提供三维空间的采集、展示、重建能力，打造低成本、高效、有针对性的 VR 空间应用解决方案。",
                    "type": [
                        "appliance",
                        "electric_appliance",
                        "washing_machine"
                    ],
                    "path": "fa8dac89932ee105aec72781475c3911",
                    "center": [
                        0.22515,
                        42.48655,
                        2.474349
                    ],
                    "id": "u-cFm1qrkv9Q7lOY",
                    "roomName": "\u536b\u751f\u95f4"
                },
                {
                    "panoIndex": 2,
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 1547,
                    "adsorption": null,
                    render: (item: any) => {
                        const div = document.createElement('div')
                        ReactDOM.render(<CustomConpment />, div)
                        return div
                    },
                    "position": [
                        0.779794,
                        -0.000137,
                        -2.335
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        0.707106
                    ],
                    "size": [
                        0.964656,
                        1.063765,
                        0.40084
                    ],
                    "matrix": [
                        0,
                        0,
                        -0.012,
                        0,
                        0,
                        0.010499,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0,
                        0.779794,
                        -0.000137,
                        -2.335,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        -0.012,
                        0,
                        0,
                        0.010499,
                        0,
                        0,
                        0.01,
                        0,
                        0,
                        0,
                        0.779794,
                        -0.000137,
                        -2.335,
                        1
                    ],
                    "name": "\u978b\u67dc",
                    "type": [
                        "furniture",
                        "cabinet",
                        "shoe_cabinet"
                    ],
                    "path": "1631f3effb1830dcbec9ef171236932e",
                    "center": [
                        0,
                        50.66865,
                        0
                    ],
                    "id": "u-Lev7PdkV9Q7LrC",
                    "roomName": "\u9633\u53f0"
                },
                {
                    "panoIndex": 3,
                    "icon": '//center.realsee.com/_next/image?url=https%3A%2F%2Fvrlab-static.ljcdn.com%2Frelease%2Fweb%2Fai-designer-avatar.c6b132b4.png&w=96&q=75',
                    "__type": "Item",
                    "materials": null,
                    "library": 26411,
                    "adsorption": null,
                    "position": [
                        7.03238,
                        1.856154,
                        5.323339
                    ],
                    "quaternion": [
                        0,
                        0.707106,
                        0,
                        -0.707107
                    ],
                    "size": [
                        0.301,
                        0.225,
                        0.22
                    ],
                    "matrix": [
                        0,
                        0,
                        0.006023,
                        0,
                        0,
                        0.006756,
                        0,
                        0,
                        -0.008509,
                        0,
                        0,
                        0,
                        7.03238,
                        1.856154,
                        5.323339,
                        1
                    ],
                    "matrixWorld": [
                        0,
                        0,
                        0.006023,
                        0,
                        0,
                        0.006756,
                        0,
                        0,
                        -0.008509,
                        0,
                        0,
                        0,
                        7.03238,
                        1.856154,
                        5.323339,
                        1
                    ],
                    "name": "\u7acb\u653e\u4e66 14#019",
                    "type": [
                        "home_decoration",
                        "literary_form",
                        "cultural_and_educational_books",
                        "standing_book"
                    ],
                    "path": "9c96cf14d6f5b3b47cb9f577ce2a0f68",
                    "center": [
                        0,
                        16.649999,
                        -0.0101
                    ],
                    "id": "u-FxlXwVKv9Q7Ls7",
                    "roomName": "\u5367\u5ba4A"
                },
            ]
        }
    ]


    // 画辅助线
    // function addHelper(x: number, y: number, z: number, type: string, helper?: boolean) {
    //     // const point = new THREE.Vector3();
    //     let geometry;
    //     let materials;
    //     let mesh: any
    //
    //     if (type === 'box') {
    //         geometry = new THREE.BoxGeometry(
    //             0.6,
    //             2.5,
    //             1.010696,
    //         )
    //
    //         let mats = []
    //         for (let i = 0; i < geometry.faces.length; i++) {
    //             const material = new THREE.MeshBasicMaterial({
    //                 color: new THREE.Color(Math.random() * 0xffffff)
    //             })
    //             mats.push(material)
    //         }
    //         materials = mats
    //     } else if (type === 'ball') {
    //         geometry = new THREE.SphereGeometry(0.02, 0.02, 64);
    //         materials = new THREE.MeshBasicMaterial({
    //             color: new THREE.Color(0xffffff)
    //         })
    //     }
    //     mesh = new THREE.Mesh(geometry, materials)
    //     // y 轴需要加一半的高度，因为position是从地面开始的，或者我应该算偏移更合理
    //     mesh.position.set(x, y, z)
    //
    //     if (helper) {
    //         const helper = new THREE.AxesHelper(5);
    //         mesh.add(helper)
    //     }
    //
    //     five.scene.add(mesh);
    //
    // }

    React.useEffect(() => {
        const wrapper = document.querySelector('.plugin-full-screen-container')
        if (wrapper) {
            five.plugins.itemLabelPlugin.appendTo(wrapper)
        }

    }, [])

    useFiveEventCallback('modelLoaded', () => {
        if (!itemLabels) return
        five.plugins.itemLabelPlugin.load(itemLabels[labelType])
        five.plugins.itemLabelPlugin.hooks.on('onLabelClick', itemLabel => {
            console.log('Realsee itemLabelPlugin click return data： ', itemLabel)
        })
        // setFiveState({ mode: Five.Mode.Floorplan })
        // addHelper(7.04986,
        //     -1.1e-05 + 0.70497,
        //     2.898, 'ball', true)
    }, [itemLabels])

    const switchLabel = () => {
        const newLabelType = Number(!labelType)
        five.plugins.itemLabelPlugin.load(itemLabels[newLabelType])
        setLabelType(newLabelType)
    }

    if (fiveModeReadyState !== 'Loaded') return null
    return (
        <Paper
            sx={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' }}
            className="model-item-label-plugin-show"
        >
            <BottomNavigation
                showLabels
                value={fiveState.mode}
                onChange={(_, newValue: Mode) => {
                    setFiveState({ mode: newValue });
                }}
            >
                <BottomNavigationAction label="全景漫游" icon={<DirectionsWalkIcon />} value={Five.Mode.Panorama} />
                <BottomNavigationAction label="空间总览" icon={<ViewInArIcon />} value={Five.Mode.Floorplan} />
                <BottomNavigationAction label="标签切换" onClick={switchLabel} icon={<ChangeCircleIcon />} value={null} />
            </BottomNavigation>
        </Paper>
    )

};

export default PluginShow;
