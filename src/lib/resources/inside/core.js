async function core(params, time, timeout, suf, nsuf, path) {
    setTimeout(() => {
        window.ipc.invoke('app-open-url', { url: path })
    }, timeout);
    for (const p of params) {
        await sleep(time)
        const id = new snowflake(1n, 2n).nextId().toString()
        const suffix = p.substring(p.lastIndexOf('.'))
        if (p.indexOf('http') === 0) {
            net(p, { type: 'BUFFER', timeout: timeout }).then(async (res) => {
                if (suffix.length === 4) {
                    writeFile(await normalize(path + `/${id}${suffix}`), res, { encoding: 'utf-8' }).catch(err => {
                        windowMessageSend('download-writeFile', {
                            url: p,
                        }, false, [1, 3])
                    })
                } else {
                    writeFile(await normalize(path + `/${id}.${suf}`), res, { encoding: 'utf-8' }).catch(err => {
                        windowMessageSend('download-writeFile', {
                            url: p,
                        }, false, [1, 3])
                    })
                }
            }).catch(err => {
                windowMessageSend('download-net', {
                    url: p,
                }, false, [1, 3])
            })
        } else {
            writeFile(await normalize(path + `/${id}.${nsuf}`), p, { encoding: 'utf-8' }).catch(err => {
                windowMessageSend('download-writeFile', {
                    url: p,
                }, false, [1, 3])
            })
        }
    }
}


async function imgCore(params, time, timeout, suf, path) {
    setTimeout(() => {
        window.ipc.invoke('app-open-url', { url: path })
    }, timeout);
    const id = new snowflake(1n, 2n).nextId().toString();
    let index = 1
    for (const p of params) {
        await sleep(time);
        const suffix = p.substring(p.lastIndexOf('.'));
        net(p, { type: 'BUFFER', timeout: timeout }).then(async (res) => {
            if (suffix.length === 4) {
                writeFile(await normalize(path + `/${id}_${index}${suffix}`), res, { encoding: 'utf-8' }).catch(err => {
                    windowMessageSend('download-writeFile', {
                        url: p,
                    }, false, [1, 3])
                })
            } else {
                writeFile(await normalize(path + `/${id}_${index}.${suf}`), res, { encoding: 'utf-8' }).catch(err => {
                    windowMessageSend('download-writeFile', {
                        url: p,
                    }, false, [1, 3])
                })
            }
            index++
        }).catch(err => {
            windowMessageSend('download-net', {
                url: p,
            }, false, [1, 3])
        })
    }
}