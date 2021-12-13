function core(params) {
    for (const p of params) {
        const id = new snowflake(1n, 2n).nextId().toString()
        const suffix = p.substring(p.lastIndexOf('.'))
        net(p, { type: 'BUFFER', timeout: 3000 }).then(res => {
            console.log(res);
            getExternPath(undefined).then(async (path) => {
                if (suffix.length === 4) {
                    writeFile(await normalize(path + `/${id}${suffix}`), res, { encoding: 'utf-8' })
                } else {
                    writeFile(await normalize(path + `/${id}.txt`), res, { encoding: 'utf-8' })
                }
            })
        })
    }
    setTimeout(() => {
        getExternPath(undefined).then(path => window.ipc.invoke('app-open-url', { url: path }))
    }, 2000);
}
