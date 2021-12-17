<template>
  <Head />
  <div class="container">
    <div class="info">
      <ElCard>
        <ElAffix :offset="40">
          <ElRow>
            <ElCol :span="6">无法识别的链接设置后缀:</ElCol>
            <ElCol :span="2">
              <ElInput v-model="suffix" size="mini"></ElInput>
            </ElCol>
          </ElRow>
          <ElRow>
            <ElCol :span="4">保存目录:</ElCol>
            <ElCol :span="10">
              <ElInput v-model="dPath" size="mini"></ElInput>
            </ElCol>
            <ElCol :span="4">
              <ElButton @click="openDialogSelect" size="mini">选择</ElButton>
            </ElCol>
          </ElRow>
          <ElRow>
            <ElCol :span="8">
              超时时间:
              <ElInputNumber size="mini" v-model="timeout" :step="1000"></ElInputNumber>
            </ElCol>
            <ElCol :span="8">
              间隔时间:
              <ElInputNumber size="mini" v-model="time" :step="500"></ElInputNumber>
            </ElCol>
            <ElCol :span="2">
              <ElCheckbox v-model="callback">回调</ElCheckbox>
            </ElCol>
            <ElCol :span="4">
              <ElButton size="mini" @click="download(true)">全部下载</ElButton>
            </ElCol>
            <ElCol :span="2">
              <ElButton size="mini" @click="download(false)">下载</ElButton>
            </ElCol>
          </ElRow>
        </ElAffix>
      </ElCard>
      <ElScrollbar height="500px">
        <ElSpace wrap>
          <div v-for="u in imgUrls">
            <ElCard @click="cimgUrlsChange(u.id)">
              <ElImage style="width: 100px;" :key="u.id" :src="u.url" :preview-src-list="[u.url]"></ElImage>
              <div class="cbox">
                <ElCheckbox :class="'cbox' + u.id" v-model="u.ckb" @change="cimgUrlsChange(u.id)"></ElCheckbox>
              </div>
            </ElCard>
          </div>
        </ElSpace>
      </ElScrollbar>
    </div>
  </div>
</template>


<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Head from "@/renderer/views/components/head/index.vue";
import { windowMessageOn, windowShow } from "@/renderer/common/window";
import {
  ElRow, ElCol, ElMain, ElHeader, ElCheckbox, ElFooter,
  ElContainer, ElInput, ElButton, ElScrollbar, ElDialog,
  ElSpace, ElImage, ElCard, ElMessage, ElSelect, ElOption,
  ElInputNumber, ElNotification, ElAffix
} from "element-plus";
import { getExternPath } from "@/renderer/common";
import { openDialog } from "@/renderer/common/additional/dialog";
import customize from "@/renderer/store/customize";
import { snowflake } from '@/lib/util/snowflake';
import { sep } from "@/renderer/common/general/path";
let callback = ref(false)

let suffix = ref('txt')

let dPath = ref('')
if (localStorage.getItem('path')) {
  dPath.value = localStorage.getItem('path')
} else {
  dPath.value = await getExternPath()
}

let timeout = ref(3000)

let time = ref(200)

let imgUrls = ref<[{ id: string, ckb: boolean, url: string }]>([] as unknown as [{ id: string, ckb: boolean, url: string }])
let data = ref([])

let cimgUrlsChange = (id: string) => {
  for (let key = 0; key < imgUrls.value.length; key++) {
    if (imgUrls.value[key].id === id) {
      imgUrls.value[key].ckb = !imgUrls.value[key].ckb
      if (imgUrls.value[key].ckb) {
        data.value.push(imgUrls.value[key].url)
      } else {
        data.value.splice(data.value.indexOf(imgUrls.value[key].url), 1)
      }
      break
    }
  }
}

let openDialogSelect = () => {
  openDialog(customize.get().id, {
    defaultPath: dPath.value,
    title: '请选择下载路径',
    properties: ['openDirectory', 'promptToCreate']
  }).then(res => {
    if (!res.canceled) {
      dPath.value = res.filePaths[0]
      localStorage.setItem('path', dPath.value)
    }
  })
}

const download = async (all: boolean) => {
  if (all) {
    let cmd = ''
    for (let index = 0; index < imgUrls.value.length; index++) {
      if (index === imgUrls.value.length - 1) {
        cmd += `'${imgUrls.value[index].url}'`
      } else {
        cmd += `'${imgUrls.value[index].url}',`
      }
    }
    cmd.substring(0, cmd.lastIndexOf(','))
    const id = new snowflake(1n, 2n).nextId().toString()
    const cPath = dPath.value.split(await sep()).join('/')
    window.ipc.invoke('inje', {
      wid: 0, code: `
    let seData${id} = [${cmd}]
    imgCore(seData${id},${time.value},${timeout.value},'${suffix.value}','${cPath}')
  ` }).catch(err => {
        ElMessage.error('下载注入失败')
      })
    ElMessage.success('下载开始')
    return
  }
  if (data.value.length === 0) {
    ElMessage.error('当前未选中')
    return
  }
  let cmd = ''
  for (let index = 0; index < data.value.length; index++) {
    if (index === data.value.length - 1) {
      cmd += `'${data.value[index]}'`
    } else {
      cmd += `'${data.value[index]}',`
    }
  }
  cmd.substring(0, cmd.lastIndexOf(','))
  const id = new snowflake(1n, 2n).nextId().toString()
  const cPath = dPath.value.split(await sep()).join('/')
  window.ipc.invoke('inje', {
    wid: 0, code: `
    let seData${id} = [${cmd}]
    imgCore(seData${id},${time.value},${timeout.value},'${suffix.value}','${cPath}')
  ` }).catch(err => {
      ElMessage.error('下载注入失败')
    })
  ElMessage.success('下载开始')
}


onMounted(async () => {
  window.ipc.invoke('inje', {
    wid: 0,
    code: await window.ipc.invoke('inje-get-example', { wid: 0, rid: customize.get().id })
  })
});

windowMessageOn("inje-get-example", (event, args) => {
  imgUrls.value = [] as any
  for (const key in args.imgUrls) {
    imgUrls.value.push({ id: key, ckb: false, url: args.imgUrls[key] })
  }
})

windowMessageOn("download-net", (event, args) => {
  if (callback.value) {
    ElMessage.error('下载网络异常')
  }
})

windowMessageOn("download-writeFile", (event, args) => {
  if (callback.value) {
    ElMessage.error('保存文件异常')
  }
})




</script>

<style lang='scss' scoped>
@import "./scss/index";
</style>
