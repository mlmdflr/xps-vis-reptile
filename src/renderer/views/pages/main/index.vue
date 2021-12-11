<template>
  <Head></Head>
  <div class="container">
    <div class="home-info">
      <ElContainer>
        &nbsp;
        <ElHeader>
          <ElRow>
            <ElCol :span="4">
              <ElButton @click="back" size="mini" :icon="ArrowLeftBold" circle></ElButton>
            </ElCol>
            <ElCol :span="14">
              <ElInput v-model="atUrl" size="mini"></ElInput>
            </ElCol>
            <ElCol :offset="2" :span="4">
              <ElButton @click="forward" size="mini" :icon="ArrowRightBold" circle></ElButton>
            </ElCol>
          </ElRow>
          <ElRow>
            <ElCol>
              当前标题:{{ tit }}
              已加载的路由数量:{{ rCount }}
            </ElCol>
          </ElRow>
        </ElHeader>
        <ElMain>
          <ElRow>
            <ElCol :span="4">
              <ElButton @click="loadUrl" size="mini">加载url</ElButton>
            </ElCol>
            <ElCol :span="4">
              <ElButton @click="windowShow(0)" size="mini">显示后台窗体</ElButton>
            </ElCol>
            <ElCol :span="4">
              <ElButton @click="windowHide(0)" size="mini">隐藏后台窗体</ElButton>
            </ElCol>
            <ElCol :span="4">
              <ElButton @click="jnjeJs" size="mini">注入js</ElButton>
            </ElCol>
          </ElRow>&nbsp;
          <ElRow>
            <ElCol>
              <ElInput v-model="code" :rows="2" type="textarea" placeholder="Please input code"></ElInput>
            </ElCol>
          </ElRow>
        </ElMain>
        <ElFooter>
          <ElRow>
            <ElCol>
              <ElCard class="box-card" style="height: 400px;">
                <template #header>
                  <ElSpace wrap>
                    <ElCheckbox @change="AllCImgChange">全选</ElCheckbox>

                    <ElButton @click="domCoreVisb = true" size="mini">解析</ElButton>

                    <ElButton @click="imgBtn" size="mini">img标签解析</ElButton>
                    <ElButton size="mini">下载到本地</ElButton>
                    <div v-for="r in rule">
                      <ElCheckbox @change="endChange($event, r)">{{ r }}</ElCheckbox>
                    </div>
                  </ElSpace>
                </template>
                <div v-if="imgShow">
                  <ElScrollbar height="340px" :key="imgShowKey">
                    <ElSpace wrap>
                      <div v-for="u in imgUrls">
                        <ElCard @click="cimgUrlsChange(u.id)">
                          <ElImage style="width: 100px;" :key="u.id" :src="u.url"></ElImage>
                          <div class="cbox">
                            <ElCheckbox
                              :class="'cbox' + u.id"
                              v-model="u.ckb"
                              @change="cimgUrlsChange(u.id)"
                            ></ElCheckbox>
                          </div>
                        </ElCard>
                      </div>
                    </ElSpace>
                  </ElScrollbar>
                </div>
              </ElCard>
            </ElCol>
          </ElRow>
        </ElFooter>
      </ElContainer>
    </div>
    <ElDialog v-model="domCoreVisb" title="匹配项" width="50%">
      <ElRow>
        <ElCol :span="12">
          <ElSelect
            filterable
            allow-create
            default-first-option
            v-model="atTabRule"
            multiple
            placeholder="Select Label"
          >
            <ElOption v-for="item in tabRule" :key="item" :label="item" :value="item"></ElOption>
          </ElSelect>
        </ElCol>
        <ElCol :span="12">
          <ElSelect
            filterable
            allow-create
            default-first-option
            v-model="atAtbRule"
            multiple
            placeholder="Select Attributes"
          >
            <ElOption v-for="item in atbRule" :key="item" :label="item" :value="item"></ElOption>
          </ElSelect>
        </ElCol>
      </ElRow>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="domCore">开始</el-button>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import type { IpcRendererEvent } from 'electron';
import { onMounted, onUnmounted, reactive, ref, unref, watch } from 'vue';
import customize from '@/renderer/store/customize';
import {
  windowCreate,
  windowShow,
  windowHide,
  windowMessageOn,
  windowMessageRemove,
  windowBlurFocusOn
} from '@/renderer/common/window';
import Head from "@/renderer/views/components/head/index.vue";
import { ElRow, ElCol, ElMain, ElHeader, ElCheckbox, ElFooter, ElContainer, ElInput, ElButton, ElScrollbar, ElPopover, ElDialog, ElSpace, ElImage, ElCard, ElMessage, ElSelect, ElOption } from "element-plus";
import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons'
import { isNull } from '@/lib/util';


let atUrl = ref('')
let tit = ref('')
let rCount = ref('')
let imgUrls = ref<[{ id: string, ckb: boolean, url: string }]>([] as unknown as [{ id: string, ckb: false, url: string }])
let code = ref('')

let imgShow = ref(false)
let imgShowKey = ref(0)
let domCoreVisb = ref(false)

let rule = ['.jpg', '.png', '.gif', '.mp4', '.pdf', '.mp3', '其他']
let tabRule = ['source', 'img', 'video', 'audio', 'a', 'link']
let atbRule = ['src', 'href']

let atTabRule = ref([])
let atAtbRule = ref([])


let body = ref('')

let seData = ref([])
let dealSeData = ref([])

let enData = ref([])
let dealenData = ref([])


onMounted(() => {
  windowShow();
  // window.ipc.invoke('inje-get-example', { wid: 0, rid: customize.get().id })
});

const endChange = (val: any, fm: string) => {

}


const AllCImgChange = () => {
  for (let key = 0; key < imgUrls.value.length; key++) {
    imgUrls.value[key].ckb = !imgUrls.value[key].ckb
    if (imgUrls.value[key].ckb) {
      seData.value.push(imgUrls.value[key].url)
    } else {
      seData.value.splice(seData.value.indexOf(imgUrls.value[key].url), 1)
    }
  }
}

const cimgUrlsChange = (id: string) => {
  for (let key = 0; key < imgUrls.value.length; key++) {
    if (imgUrls.value[key].id === id) {
      imgUrls.value[key].ckb = !imgUrls.value[key].ckb
      if (imgUrls.value[key].ckb) {
        seData.value.push(imgUrls.value[key].url)
      } else {
        seData.value.splice(seData.value.indexOf(imgUrls.value[key].url), 1)
      }
      break
    }
  }
  console.log(seData.value);
}
const back = () => {
  window.ipc.invoke('inje-back', { wid: 0 })
}

const forward = () => {
  window.ipc.invoke('inje-forward', { wid: 0 })
}

const imgBtn = async () => {
  imgShow.value = true
  // imgShowKey.value = imgShowKey.value + 1
  // window.ipc.invoke('inje', { wid: 0, code: await window.ipc.invoke('inje-get-example', { wid: 0, rid: customize.get().id }) }).catch(err => {
  //   ElMessage.error('代码错误')
  // })
}

const domCore = async () => {
  domCoreVisb.value = false
  let s = []
  let as = []
  for (const a of atTabRule.value) {
    s.push(a)
  }
  for (const a of atAtbRule.value) {
    as.push(a)
  }
  enData.value = await window.ipc.invoke('inje-jsdom', { body: body.value, attributes: as, select: s })
}

const jnjeJs = () => {
  window.ipc.invoke('inje', { wid: 0, code: code.value }).catch(err => {
    ElMessage.error('代码错误')
  })
}

const loadUrl = () => {
  window.ipc.invoke('inje-load-url', { wid: 0, url: atUrl.value })
}
windowMessageOn("inje-get-example", (event, args) => {
  atUrl.value = args.url
  tit.value = args.title
  rCount.value = args.hisLength
  imgUrls.value = [] as any
  for (const key in args.imgUrls) {
    imgUrls.value.push({ id: key, ckb: false, url: args.imgUrls[key] })
  }
  body.value = (args.body as string).replaceAll(`\t`, '').replaceAll('\n', '')
  console.log(imgUrls);
})


</script>

<style lang='scss' scoped>
@import "./scss/index";

.cbox {
  transform: translateX(43%);
}
.demo-image__lazy {
  width: 100%;
  height: 600px;
  overflow-y: auto;
  .el-image {
    display: block;
    min-height: 200px;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
