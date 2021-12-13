"use strict";

function getExternPath(path) {
    return window.ipc.invoke('global-extern-path-get', path);
}

function sep() {
    return window.ipc.invoke('path-sep');
}

function isAbsolute(path) {
    return window.ipc.invoke('path-isAbsolute', path);
}

function dirname(path) {
    return window.ipc.invoke('path-dirname', path);
}

function normalize(path) {
    return window.ipc.invoke('path-normalize', path);
}

function basename(path) {
    return window.ipc.invoke('path-basename', path);
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * 读取目录下指定后缀文件
 * @param path
 * @param fileName
 */
function fileBySuffix(path, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-filebysuffix', { path: path, fileName: fileName })];
        });
    });
}
/**
 * 创建目录和内部文件
 * */
function mkdir(path, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-mkdir', { path: path, options: options })];
        });
    });
}
/**
 * 删除目录和内部文件
 * */
function delDir(path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-deldir', { path: path })];
        });
    });
}
/**
 * 删除文件
 * */
function unlink(path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-unlink', { path: path })];
        });
    });
}
/**
 * 检查文件是否存在于当前目录中、以及是否可写
 * @return 0 不存在 1 只可读 2 存在可读写
 */
function access(path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-access', { path: path })];
        });
    });
}
/**
 * 文件重命名
 * @return 0 失败 1 成功
 */
function rename(path, newPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-rename', { path: path, newPath: newPath })];
        });
    });
}
/**
 * 读取整个文件
 * @param path 文件路径
 * @param options 选项
 */
function readFile(path, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-readfile', { path: path, options: options })];
        });
    });
}
/**
 * 逐行读取
 * @param path
 * @param index
 */
function readLine(path, index) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-readline', { path: path, index: index })];
        });
    });
}
/**
 * 覆盖数据到文件
 * @return 0 失败 1 成功
 */
function writeFile(path, data, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-writefile', { path: path, data: data, options: options })];
        });
    });
}
/**
 * 追加数据到文件
 * @return 0 失败 1 成功
 */
function appendFile(path, data, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, window.ipc.invoke('file-appendfile', { path: path, data: data, options: options })];
        });
    });
}
