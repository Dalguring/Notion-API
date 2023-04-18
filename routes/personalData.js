const users =
    {
        서성민 : {uuid : 'f1cbe582-610d-4d90-8f66-a3b616241298'},
        차은주 : {uuid : 'daa4f90e-eea1-4648-bbe8-41f9091de5f8'},
        권덕호 : {uuid : '968e5889-f874-4da2-bf98-30b827072d2d'}
    }

function isUserExist(name) {
    return name in users;
}

export function getUserUuid(name) {
    if (isUserExist(name)) {
        return users[name].uuid;
    }
    return null;
}