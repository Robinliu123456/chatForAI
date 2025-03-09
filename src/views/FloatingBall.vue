<!--
一个很完善的悬浮球组件，接受一个事件参数，当点击该悬浮球就会触发事件
简单说说过程要解决的许多问题：
 1. 计算位置，性能优化
 2. 适配移动 pc
 3. 到处拖动导致页面文字选中问题
 4. 可以直接拖动到屏幕外问题
 5. 无法展示问题（加个 z-index:100）
 6. 当你移动悬浮球也会触发事件（需要改成只有点击才触发事件，点击拖动不触发事件）
-->
<template>
    <div style="height: 90vh;width: 98vw;">
        <div
            :style="{ right: `${right}px`, bottom: `${bottom}px` }"
            class="floating-ball"
            @click="handleClick"
            @mousedown="startDrag"
            @touchstart="startTouchDrag">
            <!-- 使用 img 标签引入 GIF 图片，并禁止拖动 -->
            <img src="@/assets/ball.gif" alt="Floating Ball GIF" style="width: 100%; height: 100%; border-radius: 50%;" draggable="false">
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
  onClick: Function
});

const ballSize = 50;
const right = ref(20); // 初始距右边距离
const bottom = ref(10); // 初始距底部距离
const isDragging = ref(false);
let startX, startY, offsetX, offsetY, moved;

const startDrag = (event) => {
  disableTextSelection();
  isDragging.value = true;
  startX = event.clientX;
  startY = event.clientY;
  // 根据悬浮球的当前位置重新计算 offsetX 和 offsetY
  offsetX = (window.innerWidth - right.value - 25) - startX;
  offsetY = (window.innerHeight - bottom.value - 30) - startY;
  moved = false;

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', stopDrag);
};

const startTouchDrag = (event) => {
  disableTextSelection();
  event.preventDefault();
  const touch = event.touches[0];
  isDragging.value = true;
  startX = touch.clientX;
  startY = touch.clientY;
  // 同样重新计算 offsetX 和 offsetY
  offsetX = (window.innerWidth - right.value - 30) - startX;
  offsetY = (window.innerHeight - bottom.value - 20) - startY;
  moved = false;

  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', stopTouchDrag);
};


let animationFrameId = null;

const onMouseMove = (event) => {
  if (!isDragging.value) return;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  animationFrameId = requestAnimationFrame(() => {
    updatePosition(event.clientX, event.clientY);
  });
};

const onTouchMove = (event) => {
  event.preventDefault();
  if (!isDragging.value) return;
  const touch = event.touches[0];

  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  animationFrameId = requestAnimationFrame(() => {
    updatePosition(touch.clientX, touch.clientY);
  });
};

const updatePosition = (x, y) => {
  moved = true;
  const halfBallSize = ballSize / 2;
  right.value = Math.max(-halfBallSize, Math.min(window.innerWidth - x - offsetX - halfBallSize, window.innerWidth - halfBallSize));
  bottom.value = Math.max(-halfBallSize, Math.min(window.innerHeight - y - offsetY - halfBallSize, window.innerHeight - halfBallSize));
};



const stopDrag = () => {
  enableTextSelection();
  isDragging.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', stopDrag);

  if (!moved && props.onClick) {
    props.onClick();
  }
};

const stopTouchDrag = () => {
  enableTextSelection();
  isDragging.value = false;
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', stopTouchDrag);

  if (!moved && props.onClick) {
    props.onClick();
  }
};

function disableTextSelection() {
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';  // 针对 Safari 浏览器
  document.body.style.msUserSelect = 'none';      // 针对 IE 浏览器
  document.body.style.mozUserSelect = 'none';     // 针对 Firefox 浏览器
}

function enableTextSelection() {
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  document.body.style.msUserSelect = '';
  document.body.style.mozUserSelect = '';
}

const handleClick = () => {
    // 处理点击逻辑
  console.log('点击了悬浮球');
  
};
</script>

<style scoped>
.floating-ball {
  width: 100px;
  height: 100px;
  /* 更加酷炫的渐变色，使用多种颜色过渡 */
  background: linear-gradient(45deg, #ff00cc, #3333ff, #00ff99);
  background-size: 400% 400%;
  border-radius: 50%;
  position: absolute;
  cursor: grab;
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 
    0 0 20px rgba(0, 242, 255, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 动画效果，让渐变色动起来 */
  animation: gradient 15s ease infinite;
  /* 增加文字阴影 */
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.floating-ball:active {
  cursor: grabbing;
  box-shadow: 
    0 0 30px rgba(0, 242, 255, 0.8),
    0 6px 20px rgba(0, 0, 0, 0.2);
}

.floating-ball:hover {
  transform: scale(1.1);
  background: linear-gradient(45deg, #ff33cc, #6666ff, #33ff99);
  background-size: 400% 400%;
  animation: gradient 5s ease infinite;
}

/* 定义渐变色动画 */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 优化中间文字样式 */
.floating-ball span {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>

