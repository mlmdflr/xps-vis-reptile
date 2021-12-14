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
            <ElCol :span="10">
              <ElInput v-model="atUrl" size="mini" placeholder="url" ></ElInput>
            </ElCol>
            <ElCol :span="4">
              <ElInput v-model="userAgent" size="mini" placeholder="userAgent"></ElInput>
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
                    <ElButton @click="imgBtn" size="mini">img标签解析</ElButton>超时时间:
                    <ElInputNumber size="mini" v-model="timeout" :step="1000"></ElInputNumber>间隔时间:
                    <ElInputNumber size="mini" v-model="time" :step="500"></ElInputNumber>
                    <ElButton size="mini" @click="download">下载到本地</ElButton>
                  </ElSpace>
                </template>
                <div v-if="imgShow">
                  <ElScrollbar height="200px">
                    <ElSpace wrap>
                      <div v-for="u in imgUrls">
                        <ElCard @click="cimgUrlsChange(u.id)">
                          <ElImage style="width: 100px;" :key="u.id" :src="u.url" :preview-src-list="[u.url]"></ElImage>
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
                <div v-if="treeDataShow">
                  <ElScrollbar height="400px">
                    <ElTree
                      class="eltr"
                      :data="treeData"
                      show-checkbox
                      @check-change="treeDataClickChange"
                    />
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
          <el-button type="primary" @click="domCore(undefined)">开始</el-button>
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
import {
  ElRow, ElCol, ElMain, ElHeader, ElCheckbox, ElFooter,
  ElContainer, ElInput, ElTree, ElButton, ElScrollbar, ElDialog,
  ElSpace, ElImage, ElCard, ElMessage, ElSelect, ElOption,
  ElInputNumber, ElNotification
} from "element-plus";
import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons'
import { isNull } from '@/lib/util';
import { snowflake } from '@/lib/util/snowflake';

let timeout = ref(3000)

let time = ref(200)



let atUrl = ref('')
let tit = ref('')
let rCount = ref('')
let imgUrls = ref<[{ id: string, ckb: boolean, url: string }]>([] as unknown as [{ id: string, ckb: false, url: string }])


let code = ref('')

let imgShow = ref(false)
let treeDataShow = ref(false)

let domCoreVisb = ref(false)

let userAgent = ref('iPhone')

let treeData = reactive([{
  label: '.png',
  children: [] as any[],
}])


let tabRule = ['source', 'img', 'video', 'audio', 'a', 'link']
let atbRule = ['src', 'href']

let atTabRule = ref([])
let atAtbRule = ref([])

let body = ref('')

let seData = ref([])

let enData = ref([])


onMounted(() => {
  windowShow();
  // window.ipc.invoke('inje-get-example', { wid: 0, rid: customize.get().id })
});

const treeDataClickChange = (data: any) => {
  if (seData.value.indexOf(data.label) === -1) {
    seData.value.push(data.label)
  } else {
    seData.value.splice(seData.value.indexOf(data.label), 1)
  }
}

const AllCImgChange = () => {
  let l = seData.value.length
  for (let index = 0; index < l; index++) {
    seData.value.splice(0, 1)
  }


  if (imgShow.value) {
    for (let key = 0; key < imgUrls.value.length; key++) {
      imgUrls.value[key].ckb = !imgUrls.value[key].ckb
      if (imgUrls.value[key].ckb) {
        seData.value.push(imgUrls.value[key].url)
      } else {
        seData.value.splice(seData.value.indexOf(imgUrls.value[key].url), 1)
      }
    }
  }
  if (treeDataShow.value) {
    document.querySelectorAll('.eltr .el-checkbox__original').forEach(x => (x as unknown as any).click())
    for (const t of treeData) {
      for (const t1 of t.children) {
        if (t1.label.length >= 4) {
          seData.value.push(t1)
        }
      }
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
}
const back = () => {
  window.ipc.invoke('inje-back', { wid: 0 })
}

const forward = () => {
  window.ipc.invoke('inje-forward', { wid: 0 })
}

const imgBtn = async () => {
  imgShow.value = true
  treeDataShow.value = false
}

const domCore = async (data: any) => {
  domCoreVisb.value = false
  let s = []
  let as = []
  let lg = treeData.length
  for (let index = 0; index < lg; index++) {
    treeData.splice(0, 1)
  }
  for (const a of atTabRule.value) {
    s.push(a)
  }
  for (const a of atAtbRule.value) {
    as.push(a)
  }
  if (!data) {
    enData.value = await window.ipc.invoke('inje-jsdom', { body: body.value, attributes: as, select: s })
  } else {
    enData.value = data
  }
  let jpg = {
    label: '.jpg',
    children: [] as any[],
  }
  let png = {
    label: '.png',
    children: [] as any[],
  };
  let gif = {
    label: '.gif',
    children: [] as any[],
  }
  let mp4 = {
    label: '.mp4',
    children: [] as any[],
  }
  let pdf = {
    label: '.pdf',
    children: [] as any[],
  }
  let mp3 = {
    label: '.mp3',
    children: [] as any[],
  }
  let other = {
    label: '其他',
    children: [] as any[],
  }
  for (const i of enData.value) {
    switch (i.substring(i.lastIndexOf('.'))) {
      case '.jpg':
        jpg.children.push({ label: i })
        break;
      case '.png':
        png.children.push({ label: i })
        break;
      case '.gif':
        gif.children.push({ label: i })
        break;
      case '.mp4':
        mp4.children.push({ label: i })
        break;
      case '.pdf':
        pdf.children.push({ label: i })
        break;
      case '.mp3':
        mp3.children.push({ label: i })
        break;
      default:
        other.children.push({ label: i })
        break;
    }
  }
  treeDataShow.value = true
  imgShow.value = false
  treeData.push(jpg, png, gif, mp4, pdf, mp3, other)
}

const download = () => {
  let cmd = ''
  for (let index = 0; index < seData.value.length; index++) {
    console.log(seData.value[index]);
    if (index === seData.value.length - 1) {
      if (seData.value[index]?.label) {
        cmd += `'${seData.value[index].label}'`
      } else {
        cmd += `'${seData.value[index]}'`
      }
    } else {
      if (seData.value[index]?.label) {
        cmd += `'${seData.value[index].label}',`
      } else {
        cmd += `'${seData.value[index]}',`
      }
    }
  }
  cmd.substring(0, cmd.lastIndexOf(','))
  const id = new snowflake(1n, 2n).nextId().toString()
  window.ipc.invoke('inje', {
    wid: 0, code: `
    let seData${id} = [${cmd}]
    core(seData${id},${time.value},${timeout.value})
  ` }).catch(err => {
      ElMessage.error('代码错误')
    })

}

const jnjeJs = () => {
  window.ipc.invoke('inje', { wid: 0, code: code.value }).catch(err => {
    ElMessage.error('代码错误')
  })
}

const loadUrl = () => {
  window.ipc.invoke('inje-load-url', { wid: 0, url: atUrl.value, UserAgent: userAgent.value })
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
})

windowMessageOn("download-err", (event, args) => {
  ElNotification({
    title: '下载失败回调',
    message: `url:${args.url}\nerr:${args.err}`,
    position: 'bottom-right',
  })
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
