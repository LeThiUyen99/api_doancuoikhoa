const convertQueryData = (data) => {
    if (isEmpty(data)) return null
    return JSON.parse(JSON.stringify(data))
}

module.exports = { convertQueryData }