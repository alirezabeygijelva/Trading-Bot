export const configExporter = {
    exporter
}

function exporter(fileAsText) {
    let lines = fileAsText.split('\r\n');
    let result = {};
    let lastSection = null;
    lines.forEach((line) => {
        let section = /^\[([^=]+)]$/.exec(line);
        let property = !section && /^([^#=]+)(={0,1})(.*)$/.exec(line);
        if (section) {
            lastSection = section[1]
            result[lastSection] = [];
        } else if (property) {
            var value = result[lastSection];
            if (value) {
                value.push(
                    {
                        key: property[1].trim(),
                        value: property[3].trim()
                    });
            }
        }
    });
    return result;
};

