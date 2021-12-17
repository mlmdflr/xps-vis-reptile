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
							<ElInput v-model="atUrl" size="mini" placeholder="url"></ElInput>
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
							<ElButton @click="imgBtn" size="mini">img标签窗口</ElButton>
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
									<ElRow>
										<ElCol :span="4">
											<ElButton @click="domCoreVisb = true" size="mini">解析</ElButton>
										</ElCol>
										<ElCol :span="16">
											超时时间:
											<ElInputNumber size="mini" v-model="timeout" :step="1000"></ElInputNumber>间隔时间:
											<ElInputNumber size="mini" v-model="time" :step="500"></ElInputNumber>
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
										<ElCol :span="3">其他后缀:</ElCol>
										<ElCol :span="2">
											<ElInput v-model="suffix" size="mini"></ElInput>
										</ElCol>
										<ElCol :span="5">非网络连接后缀:</ElCol>
										<ElCol :span="2">
											<ElInput v-model="nSuffix" size="mini"></ElInput>
										</ElCol>
										<ElCol :span="4" :offset="1">
											<ElButton size="mini" @click="download">下载到本地</ElButton>
										</ElCol>
									</ElRow>
								</template>
								<div>
									<ElScrollbar height="220px">
										<ElTree class="eltr" :data="treeData" show-checkbox @check-change="treeDataClickChange" />
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
			<ElRow>
				<ElCol>
					<ElRadio v-model="model" label="1">dom解析</ElRadio>
					<ElRadio v-model="model" label="2">正则解析</ElRadio>
				</ElCol>
			</ElRow>
			<template #footer>
				<span class="dialog-footer">
					<el-button type="primary" @click="domCore()">开始</el-button>
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
	windowBlurFocusOn,
	windowIdRoute,
} from '@/renderer/common/window';
import Head from "@/renderer/views/components/head/index.vue";
import {
	ElRow, ElCol, ElMain, ElHeader, ElCheckbox, ElFooter,
	ElContainer, ElInput, ElTree, ElButton, ElScrollbar, ElDialog,
	ElSpace, ElRadio, ElCard, ElMessage, ElSelect, ElOption,
	ElInputNumber, ElNotification
} from "element-plus";
import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
import { snowflake } from '@/lib/util/snowflake';
import { getExternPath } from '@/renderer/common';
import { openDialog } from '@/renderer/common/additional/dialog';
import { sep } from "@/renderer/common/general/path";


let dPath = ref('')
if (localStorage.getItem('path')) {
	dPath.value = localStorage.getItem('path')
} else {
	dPath.value = await getExternPath()
}

let suffix = ref('html')

let nSuffix = ref('txt')

let timeout = ref(3000)

let time = ref(200)

let atUrl = ref('')
let tit = ref('')
let rCount = ref('')
let code = ref('')


let domCoreVisb = ref(false)

let userAgent = ref('iPhone')

let treeData = reactive([{
	label: '.png',
	children: [] as any[],
}])

let model = ref('2')

let tabRule = ['source', 'img', 'video', 'audio', 'a']
let atbRule = ['src', 'href']

let atTabRule = ref([])
let atAtbRule = ref([])

let body = ref('')

let seData = ref([])

let enData = ref([])


onMounted(() => {
	windowShow();
});

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

const treeDataClickChange = (data: any) => {
	console.log(data);
	if (seData.value.indexOf(data.label) === -1) {
		seData.value.push(data.label)
	} else {
		seData.value.splice(seData.value.indexOf(data.label), 1)
	}
}

const back = () => {
	window.ipc.invoke('inje-back', { wid: 0 })
}

const forward = () => {
	window.ipc.invoke('inje-forward', { wid: 0 })
}

const imgBtn = async () => {
	if ((await windowIdRoute('/img')).length === 0) {
		windowCreate({
			customize: {
				id: 3,
				route: '/img'
			}
		})
		windowShow(3)
	} else {
		windowShow(3)
	}
}

const domCore = async () => {
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
	enData.value = await window.ipc.invoke('inje-jsdom', { body: body.value, attributes: as, select: s, model: model.value })
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
	let zip = {
		label: '.mp3',
		children: [] as any[],
	}
	let rar = {
		label: '.rar',
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
			case '.zip':
				zip.children.push({ label: i })
				break;
			case '.rar':
				rar.children.push({ label: i })
				break;
			default:
				other.children.push({ label: i })
				break;
		}
	}
	treeData.push(jpg, png, gif, mp4, pdf, mp3, zip, rar, other)
}

const download = async () => {
	console.log(seData.value);

	let cmd = ''
	for (let index = 0; index < seData.value.length; index++) {
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
	const cPath = dPath.value.split(await sep()).join('/')
	window.ipc.invoke('inje', {
		wid: 0, code: `
    let seData${id} = [${cmd}]
    core(seData${id},${time.value},${timeout.value},'${suffix.value}','${nSuffix.value}','${cPath}')
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
	body.value = (args.body as string).replaceAll(`\t`, '').replaceAll('\n', '')
})

windowMessageOn("download-net", (event, args) => {
	ElMessage.error('下载网络异常')
})

windowMessageOn("download-writeFile", (event, args) => {
	ElMessage.error('保存文件异常')
})

windowMessageOn("start-loading", (event, args) => {
	ElMessage.success('加载完成')
})

windowMessageOn("fail-load", (event, args) => {
	ElMessage.error('加载失败,请查看后台窗口是否有异常')
})

</script>

<style lang='scss' scoped>
@import "./scss/index";

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
