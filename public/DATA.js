module.exports = {
    REGISTER_CODE_SIZE: 6,
    CODE_EXPIRE_TIME: 60 * 10 * 1000,
    CODE: {
        SUCCESS: 100,
        INVALID: 201,
        DATA_ERROE: 202,
        SEND_FAIL: 203,
        DB_ERROR: 204,
        VIRES: 205,
        NO_FILE: 206,
        MAX_IMAGE_LIMIT: 207,
        ERROR_IMAGE_TYPE: 208
    },
    IMAGETYPE: ['jpg', 'jpeg', 'png', 'bmp'],
    MAX_IMAGE_SIZE: 500000,
    COLLECTION: {
        GROUP: 'group',
        UG: 'UG',
        BILL: 'bill',
        CODE: 'code',
        SECRETKEY: 'secretKey',
        USER: 'user',
        INVITATION: 'invitation'
    }
}