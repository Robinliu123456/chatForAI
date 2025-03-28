<template>
  <!-- <t-space align="center">
    <t-button theme="primary" @click="visibleModelessDrag = true">AI助手可拖拽</t-button>
  </t-space> -->
  <FloatingBall @click="visibleModelessDrag = true"></FloatingBall>
  <t-dialog
    :top="10"
    :right="10"
    v-model:visible="visibleModelessDrag"
    :footer="false"
    header="AI助手-DeepSeek大模型"
    mode="modeless"
    draggable
    :on-confirm="() => (visibleModelessDrag = false)"
  >
    <template #body>
      <t-chat
        layout="single"
        style="height: 600px"
        :clear-history="chatList.length > 0 && !isStreamLoad"
        @on-action="operation"
        @clear="clearConfirm"
      >
        <template v-for="(item, index) in chatList" :key="index">
          <t-chat-item
            :avatar="item.avatar"
            :name="item.name"
            :role="item.role"
            :datetime="item.datetime"
            :content="item.content"
            :text-loading="index === 0 && loading"
          >
          <template v-if="!isStreamLoad" #actions>
            <t-chat-action
              :is-good="isGood"
              :item-index="index"
              :is-bad="isBad"
              :content="item.content"
              @operation="handleOperation"
            />
          </template>
          </t-chat-item>
        </template>
        <template #footer>
          <t-chat-input :stop-disabled="isStreamLoad" @send="inputEnter" @stop="onStop"> </t-chat-input>
        </template>
      </t-chat>
    </template>
  </t-dialog>
</template>
<script setup>
import { ref } from 'vue';
import FloatingBall from './FloatingBall.vue';
import { MockSSEResponse } from './sseRequest.ts';
import chatAbatar from '@/assets/chat-avatar.png'
import avatar from '@/assets/avatar.jpg'
import ball from '@/assets/ball.gif'

const visibleModelessDrag = ref(false);
const fetchCancel = ref(null);
const loading = ref(false);
const isStreamLoad = ref(false);
const isGood = ref(false);
const isBad = ref(false);

// 倒序渲染
const chatList = ref([
  {
    content: `由 <span>deepseek</span> 辅助 <span>决策</span>`,
    role: 'model-change',
  },
  {
    avatar: ball,
    name: 'AI',
    datetime: '今天16:38',
    content: '它叫 McMurdo Station ATM，是美国富国银行安装在南极洲最大科学中心麦克默多站的一台自动提款机。',
    role: 'assistant',
  },
  {
    avatar: avatar,
    name: '自己',
    datetime: '今天16:38',
    content: '南极的自动提款机叫什么名字？',
    role: 'user',
  },
]);
const operation = function (type, options) {
  console.log(type, options);
};
const clearConfirm = function () {
  chatList.value = [];
};
const onStop = function () {
  if (fetchCancel.value) {
    fetchCancel.value.controller.close();
    loading.value = false;
  }
};
const inputEnter = function (inputValue) {
  if (isStreamLoad.value) {
    return;
  }
  if (!inputValue) return;
  
  // 定义一个函数将日期转换为指定格式
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const params = {
    avatar: avatar,
    name: '自己',
    // 使用自定义函数格式化日期
    datetime: formatDate(new Date()),
    content: inputValue,
    role: 'user',
  };
  chatList.value.unshift(params);
  // 空消息占位
  const params2 = {
    avatar: ball,
    name: 'TD&AI',
    content: '',
    role: 'assistant',
  };
  chatList.value.unshift(params2);
  handleData(inputValue);
};
const fetchSSE = async (fetchFn, options) => {
  const response = await fetchFn();
  const { success, fail, complete } = options;
  // 如果不 ok 说明有请求错误
  if (!response.ok) {
    complete?.(false, response.statusText);
    fail?.();
    return;
  }
  const reader = response?.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;
  const bufferArr = [];
  let dataText = ''; // 记录数据
  const event = { data: null };

  reader.read().then(function processText({ done, value }) {
    if (done) {
      // 正常的返回
      complete?.(true);
      return;
    }
    const chunk = decoder.decode(value, { stream: true });
    const buffers = chunk.toString().split(/\r?\n/);
    bufferArr.push(...buffers);
    const i = 0;
    while (i < bufferArr.length) {
      const line = bufferArr[i];
      if (line) {
        dataText = dataText + line;
        event.data = dataText;
      }
      if (event.data) {
        const jsonData = JSON.parse(JSON.stringify(event));
        success(jsonData);
        event.data = null;
      }
      bufferArr.splice(i, 1);
    }
    reader.read().then(processText);
  });
};
const handleData = async () => {
  loading.value = true;
  isStreamLoad.value = true;
  const lastItem = chatList.value[0];
  const mockedData = `example
`;
  const mockResponse = new MockSSEResponse(mockedData);
  fetchCancel.value = mockResponse;
  await fetchSSE(
    () => {
      return mockResponse.getResponse();
    },
    {
      success(result) {
        loading.value = false;
        const { data } = result;
        lastItem.content += data;
      },
      complete(isOk, msg) {
        if (!isOk || !lastItem.content) {
          lastItem.role = 'error';
          lastItem.content = msg;
        }
        // 控制终止按钮
        isStreamLoad.value = false;
        loading.value = false;
      },
    },
  );
};
const handleOperation = function (type, options) {
  const { index } = options;
  if (type === 'good') {
    isGood.value = !isGood.value;
    isBad.value = false;
  } else if (type === 'bad') {
    isBad.value = !isBad.value;
    isGood.value = false;
  } else if (type === 'replay') {
    const userQuery = chatList.value[index + 1].content;
    inputEnter(userQuery);
  }
};
</script>
<style  lang="less">
.chat-ai {
  height: 600px;
}
// 添加自定义样式来改变对话框的背景颜色
// .t-dialog {
//   background-color: rgb(232, 19, 19) !important; // 这里可以根据需要修改背景颜色
// }
</style>
