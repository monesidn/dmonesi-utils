

export const keyFromURL = (url: string | URL) => {
    if (typeof url === 'string')
        url = new URL(url);

    // Removes the leading /
    return url.pathname.substr(1);
};
