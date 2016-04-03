module.exports = {
    _getSafe(obj, pathStr) {
        const pathArray = pathStr.split('.');

        function get(obj, path) {
            const prop = obj[path[0]];
            if (path.length === 1) {
                return prop;
            }
            else if (prop && typeof prop === "object") {
                return get(prop, path.slice(1, path.length))
            }
            else {
                return null;
            }
        }

        return get(obj, pathArray);
    }
};