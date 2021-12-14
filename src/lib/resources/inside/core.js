async function core(params, time, timeout) {
    setTimeout(() => {
        getExternPath(undefined).then(path => window.ipc.invoke('app-open-url', { url: path }))
    }, timeout);
    for (const p of params) {
        await sleep(time)
        const id = new snowflake(1n, 2n).nextId().toString()
        const suffix = p.substring(p.lastIndexOf('.'))
        if (p.indexOf('http') === 0) {
            net(p, { type: 'BUFFER', timeout: timeout }).then(res => {
                getExternPath(undefined).then(async (path) => {
                    if (suffix.length === 4) {
                        writeFile(await normalize(path + `/${id}${suffix}`), res, { encoding: 'utf-8' }).catch(err => {
                            windowMessageSend('download-err', {
                                url: p,
                                err: err
                            }, false, [1])
                        })
                    } else {
                        writeFile(await normalize(path + `/${id}.txt`), res, { encoding: 'utf-8' })
                    }
                })
            }).catch(err => {
                windowMessageSend('download-err', {
                    url: p,
                    err: err
                }, false, [1])
            })
        } else {
            getExternPath(undefined).then(async (path) => {
                writeFile(await normalize(path + `/${id}.txt`), p, { encoding: 'utf-8' }).catch(err => {
                    windowMessageSend('download-err', {
                        url: p,
                        err: err
                    }, false, [1])
                })
            })
        }
    }
}
