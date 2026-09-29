// ========== 群友缸：Matter.js 真实物理 ==========
(function () {
  const { Engine, World, Bodies, Body, Composite, Mouse, MouseConstraint, Vector, Events, Common } = Matter;

  const stage = document.getElementById('stage');
  const W = window.innerWidth;
  const H = window.innerHeight;

  // 缸尺寸
  const jarW = Math.min(920, W - (W < 700 ? 28 : 60));
  const floorY = H - (W < 700 ? 132 : 110);
  const wallT = 60;                 // 墙厚度（视觉外）
  const leftX = (W - jarW) / 2;
  const rightX = leftX + jarW;
  const jarTop = floorY - (W < 700 ? H * 0.70 : Math.min(560, H * 0.62));

  // 球半径（随人数自适应）
  const n = MEMBERS.length;
  const R = Common.clamp(Math.round(jarW / Math.sqrt(n) / (W < 700 ? 2.2 : 2.1)), W < 700 ? 24 : 28, W < 700 ? 40 : 50);

  // ---- 引擎 ----
  const engine = Engine.create();
  engine.gravity.y = 1;
  const world = engine.world;

  // ---- 缸壁（静态，隐形，自绘玻璃） ----
  const wallOpts = { isStatic: true, render: { visible: false } };
  const floor = Bodies.rectangle(W / 2, floorY + wallT / 2, jarW + wallT * 2, wallT, wallOpts);
  const leftWall = Bodies.rectangle(leftX - wallT / 2, (floorY + jarTop) / 2, wallT, floorY - jarTop + wallT, wallOpts);
  const rightWall = Bodies.rectangle(rightX + wallT / 2, (floorY + jarTop) / 2, wallT, floorY - jarTop + wallT, wallOpts);
  World.add(world, [floor, leftWall, rightWall]);

  // ---- 预加载头像 ----
  function avatarUrl(qq) { return `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=640`; }
  const balls = [];

  MEMBERS.forEach((m, i) => {
    const img = new Image();
    // 不加 crossOrigin：qlogo 直接可绘制（不做像素读取，不影响显示）
    img.src = avatarUrl(m.qq);

    const x = leftX + R + Math.random() * (jarW - R * 2);
    const y = jarTop - 100 - Math.random() * 400;
    const ball = Bodies.circle(x, y, R, {
      restitution: 0.45,        // 弹性
      friction: 0.05,
      frictionAir: 0.008,
      density: 0.0012,
      render: { visible: false }
    });
    ball.member = m;
    ball.img = img;
    ball.r = R;
    balls.push(ball);
  });
  World.add(world, balls);

  // ---- 渲染器（透明，只当画布，内容自绘） ----
  const render = Matter.Render.create({
    element: stage,
    engine: engine,
    options: {
      width: W,
      height: H,
      wireframes: false,
      background: 'transparent',
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2.5)
    }
  });
  Matter.Render.run(render);

  // ---- 自绘：玻璃缸 + 圆形头像球 + 昵称 ----
  Events.on(render, 'afterRender', () => {
    const ctx = render.context;

    // 玻璃缸
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX, jarTop);
    ctx.lineTo(leftX, floorY);
    ctx.lineTo(rightX, floorY);
    ctx.lineTo(rightX, jarTop);
    ctx.stroke();
    // 缸底红色微光
    const grad = ctx.createLinearGradient(0, floorY - 60, 0, floorY);
    grad.addColorStop(0, 'rgba(255,42,42,0)');
    grad.addColorStop(1, 'rgba(255,42,42,0.12)');
    ctx.fillStyle = grad;
    ctx.fillRect(leftX, floorY - 60, jarW, 60);
    ctx.restore();

    // 球
    balls.forEach(ball => {
      const { x, y } = ball.position;
      const r = ball.r;
      ctx.save();

      // 阴影
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#222';
      ctx.fill();
      ctx.restore();

      // 圆形裁剪头像（居中 cover）
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r - 1, 0, Math.PI * 2);
      ctx.clip();
      // 高质量缩放：大图缩到小球上不再发糊
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (ball.img && ball.img.complete && ball.img.naturalWidth) {
        const iw = ball.img.naturalWidth, ih = ball.img.naturalHeight;
        const scale = Math.max((r * 2) / iw, (r * 2) / ih);
        const dw = iw * scale, dh = ih * scale;
        ctx.drawImage(ball.img, x - dw / 2, y - dh / 2, dw, dh);
      } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.restore();

      // 描边
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.stroke();
      ctx.restore();

      // 昵称（浮在球上方：字号随球变大、加粗；超长自动缩字号/省略，始终保持清晰一行）
      const name = ball.member.name;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fam = '"PingFang SC","Microsoft YaHei",sans-serif';
      let fs = Math.max(12, Math.round(r * 0.5));
      let label = name;
      const maxW = Math.min(jarW * 0.6, r * 3.8 + 40, 220);
      ctx.font = '600 ' + fs + 'px ' + fam;
      let tw = ctx.measureText(label).width;
      if (tw > maxW) {
        const shrink = Math.floor(fs * maxW / tw);
        if (shrink >= 11) {
          fs = shrink;
        } else {
          fs = 11;
          ctx.font = '600 11px ' + fam;
          while (label.length > 1 && ctx.measureText(label + '…').width > maxW) label = label.slice(0, -1);
          label += '…';
        }
        ctx.font = '600 ' + fs + 'px ' + fam;
        tw = ctx.measureText(label).width;
      }
      const ph = Math.round(fs * 1.7);          // 胶囊高度随字号
      const ly = y - r - ph / 2 - 6;
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      roundRect(ctx, x - tw / 2 - 8, ly - ph / 2, tw + 16, ph, ph / 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(label, x, ly + 0.5);
      ctx.restore();
    });
  });

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---- 鼠标/触摸 拖拽 ----
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
  });
  World.add(world, mouseConstraint);
  render.mouse = mouse;

  // 手机高清画布会被放大显示，按“世界尺寸/实际显示尺寸”换算坐标（桌面为1，不影响）
  function syncMouseScale() {
    const cv = render.canvas;
    const rectW = cv.clientWidth || cv.width;
    const rectH = cv.clientHeight || cv.height;
    const pr = mouse.pixelRatio || 1;
    // 与 Mouse._getRelativeMousePosition 的分母严格抵消，使坐标恒为 CSS 像素
    const fx = (rectW / cv.width) * pr;
    const fy = (rectH / cv.height) * pr;
    mouse.scale.x = fx;
    mouse.scale.y = fy;
    mouse.offset.x = 0;
    mouse.offset.y = 0;
  }
  syncMouseScale();
  window.addEventListener('resize', syncMouseScale);
  window.addEventListener('touchstart', syncMouseScale, { passive: true });

  // 重叠时在开始拖拽瞬间强制改抓“最上层”球
  Events.on(mouseConstraint, 'startdrag', () => {
    const pos = mouse.position;
    const hit = balls.filter(b => {
      const dx = b.position.x - pos.x;
      const dy = b.position.y - pos.y;
      return dx * dx + dy * dy <= b.r * b.r;
    });
    if (hit.length) {
      const top = hit[hit.length - 1];
      if (top !== mouseConstraint.body) {
        mouseConstraint.body = top;
        mouseConstraint.constraint.bodyB = top;
        mouseConstraint.constraint.pointB = { x: pos.x - top.position.x, y: pos.y - top.position.y };
        mouseConstraint.constraint.angleB = top.angle;
      }
    }
  });
  // ---- 运行循环 ----
  Matter.Runner.run(engine);

  // ---- 摇一摇：给所有球随机冲量 ----
  document.getElementById('shakeBtn').addEventListener('click', () => {
    balls.forEach(ball => {
      Body.applyForce(ball, ball.position, {
        x: (Math.random() - 0.5) * 0.35,
        y: -Math.random() * 0.4 - 0.05
      });
      Body.setAngularVelocity(ball, (Math.random() - 0.5) * 0.3);
    });
  });

  // ---- 重新装缸 ----
  document.getElementById('resetBtn').addEventListener('click', () => location.reload());
})();
