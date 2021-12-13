"use strict";
/**
 * @description 雪花算法类,用于生成随机id
 * @author 没礼貌的芬兰人
 * @date 2021-10-06 17:13:16
 */
var snowflake = /** @class */ (function () {
    function snowflake(workerId, dataCenterId) {
        this.twepoch = 1548988646430n;
        this.workerIdBits = 5n; // 标识ID
        this.dataCenterIdBits = 5n; // 机器ID
        this.sequenceBits = 12n; // 序列ID
        this.maxWorkerId = -1n ^ (-1n << this.workerIdBits);
        this.maxDataCenterId = -1n ^ (-1n << this.dataCenterIdBits);
        this.sequenceMask = -1n ^ (-1n << this.sequenceBits);
        this.workerIdShift = this.sequenceBits;
        this.dataCenterIdShift = this.sequenceBits + this.workerIdBits;
        this.timestampLeftShift = this.dataCenterIdShift + this.dataCenterIdBits;
        this.sequence = 0n;
        this.lastTimestamp = -1n;
        if (workerId > this.maxWorkerId || workerId < 0n) {
            throw new Error("workerId can't be greater than ".concat(this.maxWorkerId, " or less than 0"));
        }
        if (dataCenterId > this.maxDataCenterId || dataCenterId < 0n) {
            throw new Error("dataCenterId can't be greater than ".concat(this.maxDataCenterId, " or less than 0"));
        }
        this.workerId = workerId;
        this.dataCenterId = dataCenterId;
        return this;
    }
    snowflake.prototype.nextId = function () {
        var timestamp = this.currentLinuxTime();
        var diff = timestamp - this.lastTimestamp;
        if (diff < 0n) {
            throw new Error("Clock moved backwards. Refusing to generate id for ".concat(-diff, " milliseconds"));
        }
        if (diff === 0n) {
            this.sequence = (this.sequence + 1n) & this.sequenceMask;
            if (this.sequence == 0n) {
                timestamp = this.tilNextMillis(this.lastTimestamp);
            }
        }
        else {
            this.sequence = 0n;
        }
        this.lastTimestamp = timestamp;
        return (((timestamp - this.twepoch) << this.timestampLeftShift) |
            (this.dataCenterId << this.dataCenterIdShift) |
            (this.workerId << this.workerIdShift) |
            this.sequence);
    };
    snowflake.prototype.tilNextMillis = function (lastTimeStamp) {
        var timestamp = this.currentLinuxTime();
        while (timestamp <= lastTimeStamp) {
            timestamp = this.currentLinuxTime();
        }
        return timestamp;
    };
    snowflake.prototype.currentLinuxTime = function () {
        return BigInt(new Date().valueOf());
    };
    return snowflake;
}());