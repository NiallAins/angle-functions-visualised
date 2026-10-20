Math.argumentsToPoints = args => {
    args = Array.from(args);
    if (
        typeof args[0] === 'object' &&
        typeof args[0][0] === 'object'
    ) {
        args.map(a => a.flat());
    }
    if (typeof args[0] === 'number') {
        let pts = [];
        for (let i = 0; i < args.length; i += 2) {
            pts.push({
                x: args[i],
                y: i === args.length - 1 ? 0 : args[i + 1]
            });
        }
        return pts;
    }
    return args.map(p => Math.arrToXY(p));
}
Math.allAnglesFromPoints = function() {
    let p = Math.argumentsToPoints(arguments);
    switch (p.length) {
        case 1:
            p.push(
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                { x: 1, y: 0 }
            );
            break;
        case 2:
            let p1 = p.pop();
            p.push(
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                p1,
            );
            break;
        case 3:
            p.splice(1, 0, p[1]);
            break;
    }
    
    let
        ang = ((
            Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x) -
            Math.atan2(p[3].y - p[2].y, p[3].x - p[2].x)
        ) + Math.TAU) % Math.TAU,
        int = ang < Math.PI ? Math.PI - ang : Math.TAU - ang,
        intAnti = Math.PI - int,
        ext = int + Math.PI,
        extAnti = intAnti + Math.PI;
    
    return {
        clockwise: ang < Math.PI ? int : ext,
        anti: ang < Math.PI ? extAnti : intAnti,
        int,
        intAnti,
        ext,
        extAnti,
        minInt: Math.min(int, intAnti),
        maxInt: Math.max(int, intAnti),
        minExt: Math.min(ext, extAnti),
        maxExt: Math.max(ext, extAnti)
    };
}
Math.TAU = Math.PI * 2;
Math.det = (a, b) => (a.x * b.y) - (a.y * b.x);
Math.dist = function(...args) {
    let squared = false;
    if (typeof args[args.length - 1] === 'boolean') {
        squared = args[args.length - 1];
        args = Array.from(args);
        args.pop();
    }
    let p = Math.argumentsToPoints(args);
    const SD = Math.pow(p[1].x - p[0].x, 2) + Math.pow(p[1].y- p[0].y, 2);
    return squared ? SD : Math.sqrt(SD);
}
Math.arrToXY = p => ({
    x: typeof p.x === 'number' ? p.x : p[0],
    y: typeof p.y === 'number' ? p.y : p[1]
});
Math.XYToArr = p => [
    typeof p.x === 'number' ? p.x : p[0],
    typeof p.x === 'number' ? p.y : p[1]
];
Math.intersectionFromPoints = (p00, p01, p10, p11) => {
    p00 = Math.arrToXY(p00);
    p01 = Math.arrToXY(p01);
    p10 = Math.arrToXY(p10);
    p11 = Math.arrToXY(p11);
    let
        xd = { x: p00.x - p01.x, y: p10.x - p11.x },
        yd = { x: p00.y - p01.y, y: p10.y - p11.y },
        div = Math.det(xd, yd);
    if (div === 0) {
        return false;
    }
    let
        d = {
            x: Math.det(p00, p01),
            y: Math.det(p10, p11)
        },
        x = Math.det(d, xd) / div,
        y = Math.det(d, yd) / div;
    
        return {
            x: Math.det(d, xd) / div,
            y: Math.det(d, yd) / div
        };
}

function createCanvas(options) {
    options = {
        position: options?.position || 'fixed',
        width:    typeof options?.width    !== 'undefined' ? options.width    : window.innerWidth,
        height: typeof options?.height !== 'undefined' ? options.height : window.innerHeight,
        center: typeof options?.center !== 'undefined' ? options.center : true,
        square: typeof options?.square !== 'undefined' ? options.square : false
    };
    const
        CAN = document.createElement('canvas'),
        CTX = CAN.getContext('2d'),
        MIN_W = Math.min(window.innerWidth, window.innerHeight);
    CAN.width = options.square ? MIN_W : options.width;
    CAN.height = options.square ? MIN_W : options.height;
    if (options.position !== 'none') {
        CAN.style.position = options.position;
        if (options.position === 'fixed') {
            CAN.style.inset = 0;
        }
        document.body.appendChild(CAN);
    }
    if (options.center) {
        CTX.translate(CAN.width * 0.5, CAN.height * 0.5);
    }
    return [CAN, CTX, CAN.width * 0.5, CAN.height * 0.5];
}

Object.defineProperty(
    CanvasRenderingContext2D.prototype,
    'clear', {
        value: function() {
            this.save();
            this.resetTransform();
            this.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.restore();
        }
    });
Object.defineProperty(
    CanvasRenderingContext2D.prototype,
    'setStyle', {
        value: function(style) {
            this.strokeStyle = style;
            this.fillStyle = style;
        }
    });
Object.defineProperty(
    CanvasRenderingContext2D.prototype,
    'fillCircle', {
        value: function(x, y, r, whiteCenter) {
            this.beginPath();
            this.arc(x, y, r, 0, Math.TAU);
            this.fill();
            this.save();
            if (whiteCenter) {
                this.beginPath();
                this.fillStyle = '#fff';
                this.arc(x, y, r - 2, 0, Math.TAU);
                this.fill();
                this.restore();
            }
        }
    });
Object.defineProperty(
    CanvasRenderingContext2D.prototype,
    'strokeArc', {
        value: function(x, y, r, a0, a1, dir) {
            this.beginPath();
            this.arc(x, y, r, a0, a1, dir);
            this.stroke();
        }
    });
Object.defineProperty(
    CanvasRenderingContext2D.prototype,
    'strokeLine', {
        value: function() {
            this.beginPath();
            Array.from(arguments)
                .map(a => Math.XYToArr(a))
                .forEach(a => this.lineTo(a[0], a[1]));
            this.stroke();
        }
    });
Object.defineProperty(
    CanvasRenderingContext2D.prototype,
    'arrowHead', {
        value: function(x, y, a, w = 20, t = 2, align) {
            this.save();
                this.translate(x, y);
                this.rotate(a);
                if (align === 'center') {
                    this.translate(w * 0.5, 0);
                } else if (align === 'bottom') {
                    this.translate(w * 0.75, 0);
                }
                this.beginPath();
                this.moveTo(w * -0.75, w * -0.5);
                this.lineTo(0, 0);
                this.lineTo(w * -0.75, w * 0.5);
                if (t === 1) {
                    this.closePath();
                }
                if (t === 2) {
                    this.fill();
                } else {
                    this.stroke();
                }
            this.restore();
        }
    });

const
    [CAN, CTX, CAN_RW, CAN_RH] = createCanvas(),
    DOT_R = 8,
    LINE_THICK = 4,
    LINE_THIN = 1;

let text = document.createElement('div');
text.style.position = 'fixed';
text.style.bottom = '16px';
text.style.left = '16px';
text.style.display = 'grid';
text.style.gridTemplateColumns = 'auto auto';
text.style.gap = '0 16px';
text.style.background = '#fff8';
text.style.color = '#666';
text.style.pointerEvents =
    text.style.userSelect ='none';
document.body.appendChild(text);

CTX.font = text.style.font = '14px Helvetica';

let
    p00 = { x:    223, y:    137 },
    p01 = { x: -319, y: -50 },
    p10 = { x: -255, y:    244 },
    p11 = { x:    100, y: -200 };

function pointToString(p) {
    return '[' + p.x.toFixed(0) + ', ' + p.y.toFixed(0) + ']';
}

function outlineText(t0, t1, pX, pY) {
    if (typeof pX === 'object') {
        pY = typeof pX.y === 'number' ? pX.y : pX[1];
        pX = typeof pX.x === 'number' ? pX.x : pX[0];
    };
    const offsetX = DOT_R * 2;
    CTX.save();
        CTX.strokeStyle = '#fff8';
        CTX.lineWidth = 8;
        CTX.lineJoin = 'bevel';
        CTX.strokeText(t0, pX + offsetX, pY - 8);
        CTX.strokeText(t1, pX + offsetX, pY + 8);
    CTX.restore();
    CTX.fillText(t0, pX + offsetX, pY - 8);
    CTX.fillText(t1, pX + offsetX, pY + 8);
}

function arcArrow(fill, x, y, r, a0, a1, counter) {
    const
        TW = 10,
        TH = 15;
    a0 += 0.05 * (counter ? -1 : 1);
    a1 += 0.075 * (counter ? 1 : -1);
    if (
        (counter && a1 < a0) ||
        (!counter && a1 > a0)
    ) {
        CTX.strokeArc(x, y, r, a0, a1, counter);
    }
    if (!fill) {
        CTX.save();
            CTX.fillStyle = 'white';
            CTX.arrowHead(
                x + (Math.cos(a1) * r),
                y + (Math.sin(a1) * r),
                counter
                    ? a1 - (Math.PI * 0.5)
                    : a1 + (Math.PI * 0.5),
                20, 2,
                'center'
            );
        CTX.restore();
    }
    CTX.arrowHead(
        x + (Math.cos(a1) * r),
        y + (Math.sin(a1) * r),
        counter
            ? a1 - (Math.PI * 0.5)
            : a1 + (Math.PI * 0.5),
        20, fill ? 2 : 1,
        'center'
    );
}

function draw() {
    window.requestAnimationFrame(() => {
        CTX.clear();
        
        CTX.setStyle('#666');
        CTX.lineWidth = LINE_THIN;
        CTX.strokeLine([-CAN_RW, 0], [CAN_RW, 0]);
        CTX.strokeLine([0, -CAN_RH, 0], [0, CAN_RH]);

        let pInter = Math.intersectionFromPoints(p00, p01, p10, p11);
        let
            ang0 = Math.atan2(p01.y - p00.y, p01.x - p00.x),
            ang1 = Math.atan2(p11.y - p10.y, p11.x - p10.x);
        [
            { c: 'blue', p0: p00, p1: p01, a: ang0 },
            { c: 'red',    p0: p10, p1: p11, a: ang1 }
        ].forEach((l, li) => {
            CTX.setStyle(l.c);
            CTX.lineWidth = LINE_THICK;
            CTX.strokeLine(
                [ pInter.x, pInter.y ],
                [
                    pInter.x + (Math.cos(l.a) * CAN.width * (li ? 25 : -25)),
                    pInter.y + (Math.sin(l.a) * CAN.width * (li ? 25 : -25))
                ]
            );
            
            CTX.lineWidth = LINE_THIN;
            CTX.strokeLine(
                [ pInter.x, pInter.y ],
                [
                    pInter.x + (Math.cos(l.a) * CAN.width * (li ? -100 : 100)),
                    pInter.y + (Math.sin(l.a) * CAN.width * (li ? -100 : 100))
                ]
            );
            CTX.lineWidth = LINE_THICK;
            CTX.arrowHead(
                li
                    ? l.p1.x - (Math.cos(l.a) * 35)
                    : l.p0.x + (Math.cos(l.a) * 35),
                li
                    ? l.p1.y - (Math.sin(l.a) * 35)
                    : l.p0.y + (Math.sin(l.a) * 35),
                l.a, 20, 0
            );
            CTX.fillCircle(l.p0.x, l.p0.y, DOT_R, true);
            CTX.fillCircle(l.p1.x, l.p1.y, DOT_R, true);
        });

        CTX.setStyle('purple');
        CTX.fillCircle(pInter.x, pInter.y, DOT_R * 0.75);
        
        let {
            int,
            intAnti,
            ext,
            extAnti,
            minInt,
            maxInt,
            minExt,
            maxExt,
            clockwise,
            anti
        } = Math.allAnglesFromPoints(p00, p01, p10, p11);
        
        const
            R_CI = 100,
            R_AI = 100,
            R_CO = 175,
            R_AO = 225,
            ARROW_PAD = 0.075;
        CTX.setStyle('green');
        CTX.lineWidth = int === clockwise ? LINE_THICK : LINE_THIN;
        arcArrow(
            int === clockwise,
            pInter.x, pInter.y, R_CI,
            ang0 + Math.PI + ARROW_PAD,
            int < ARROW_PAD * 2
                ? ang0 + Math.PI + ARROW_PAD
                : ang0 + Math.PI + int - ARROW_PAD
        );
        CTX.lineWidth = ext === clockwise ? LINE_THICK : LINE_THIN;
        arcArrow(
            ext === clockwise,
            pInter.x, pInter.y, R_CO,
            ang0 + Math.PI + ARROW_PAD,
            ang0 + Math.PI + ext - ARROW_PAD
        );
        CTX.setStyle('orange');
        CTX.lineWidth = intAnti === anti ? LINE_THICK : LINE_THIN;
        arcArrow(
            intAnti === anti,
            pInter.x, pInter.y, R_AI,
            ang0 + Math.PI - ARROW_PAD,
            intAnti < ARROW_PAD * 2
                ? ang0 + Math.PI - ARROW_PAD
                : ang0 + Math.PI - intAnti + ARROW_PAD,
            true
        );
        CTX.lineWidth = extAnti === anti ? LINE_THICK : LINE_THIN;
        arcArrow(
            extAnti === anti,
            pInter.x, pInter.y, R_AO,
            ang0 + Math.PI - ARROW_PAD,
            ang0 + Math.PI - extAnti + ARROW_PAD,
            true
        );
        
        [
            { c: 'blue', p0: p00, p1: p01, a: ang0 },
            { c: 'red',    p0: p10, p1: p11, a: ang1 }
        ].forEach((l, li) => {
            CTX.setStyle(l.c);
            outlineText(
                `L${li + 1}, P1`,
                pointToString(l.p0),
                l.p0
            );
            outlineText(
                `L${li + 1}, P2`,
                pointToString(l.p1),
                l.p1
            );
        });
        
        const
            R_PAD = 50,
            A_PAD = 0;
        let ang = ang0 + (int / 2) + Math.PI;
        CTX.setStyle('green');
        outlineText(
            clockwise === int ? 'Clockwise /' : '',
            'Clockwise Interior',
            [
                pInter.x + (Math.cos(ang) * (R_CI)),
                pInter.y + (Math.sin(ang) * (R_CI))
            ]
        );
        ang = ang0 + (ext / 2) + Math.PI;
        outlineText(
            clockwise === ext ? 'Clockwise /' : '',
            'Clockwise Exterior',
            [
                pInter.x + (Math.cos(ang) * (R_CO)),
                pInter.y + (Math.sin(ang) * (R_CO))
            ]
        );
        CTX.setStyle('orange');
        ang = ang0 - (intAnti / 2) + Math.PI;
        outlineText(
            anti === intAnti ? 'Anti-clockwise /' : '',
            'Anti Interior',
            [
                pInter.x + (Math.cos(ang) * (R_AI)),
                pInter.y + (Math.sin(ang) * (R_AI))
            ]
        );
        ang = ang0 - (extAnti / 2) + Math.PI;
        outlineText(
            anti === extAnti ? 'Anti-clockwise /' : '',
            'Anti Exterior',
            [
                pInter.x + (Math.cos(ang) * (R_AO)),
                pInter.y + (Math.sin(ang) * (R_AO))
            ]
        );
        
        text.innerHTML = `
            <span>Clockwise</span><span>${clockwise.toFixed(2)}</span>
            <span>Anticlockwise</span><span>${anti.toFixed(2)}</span>
            <span>&nbsp;</span><span>&nbsp;</span>
            <span>Int</span><span>${int.toFixed(2)}</span>
            <span>Int Anti</span><span>${intAnti.toFixed(2)}</span>
            <span>Ext</span><span>${ext.toFixed(2)}</span>
            <span>Ext Anti</span><span>${extAnti.toFixed(2)}</span>
            <span>&nbsp;</span><span>&nbsp;</span>
            <span>Min Int</span><span>${minInt.toFixed(2)}</span>
            <span>Max Int</span><span>${maxInt.toFixed(2)}</span>
            <span>Min Ext</span><span>${minExt.toFixed(2)}</span>
            <span>Max Ext</span><span>${maxExt.toFixed(2)}</span>
        `;
    });
}

let dragP = null;
CAN.onmousedown = e => {
    [
        p00,
        p01,
        p10,
        p11
    ].forEach(p => {
        if (Math.dist(
            e.clientX - CAN_RW,
            e.clientY - CAN_RH,
            p.x, p.y,
            true
        ) < 200) {
            dragP = p;
        };
    });
}
CAN.onmousemove = e => {
    if (dragP) {
        dragP.x = e.clientX - CAN_RW;
        dragP.y = e.clientY - CAN_RH;
        draw();
    } else {
        CAN.style.cursor = [
                p00,
                p01,
                p10,
                p11
            ].some(p => Math.dist(
                e.clientX - CAN_RW,
                e.clientY - CAN_RH,
                p.x, p.y,
                true
            ) < 200) ? 'pointer' : 'default';
    }
};
CAN.onmouseup =
CAN.onmouseleave =
    e => dragP = null;

draw();