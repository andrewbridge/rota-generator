import { computed, ref } from "../deps/vue.mjs";
import Configure from "../pages/Configure.mjs";
import Importer from "../pages/Importer.mjs";
import Viewer from "../pages/Viewer.mjs";
// import Generator from "../pages/Generator.mjs";

export const routes = {
    '/': Viewer,
    '/configure': Configure,
    '/import': Importer,
    // '/old': Generator,
};

export const routeMap = new WeakMap();
for (const route in routes) {
    routeMap.set(routes[route], route);
}

export const getRoute = (component) => '#' + (routeMap.get(component) || '/');

export const activeHash = ref(window.location.hash.slice(1) || '/');
export const activeRoute = ref(routes[activeHash.value]);
export const queryParameters = ref(null);
export const queryParametersObject = computed(() => {
    if (queryParameters.value === null) {
        return {};
    }
    const object = {};
    for (const [key, value] of queryParameters.value) {
        object[key] = value;
    }
    return object;
});

const selectRoute = () => {
    const routeWithQueryParameters = window.location.hash.match(/(.+)(\?.+)$/);
    var routeName = routeWithQueryParameters ? routeWithQueryParameters[1] : window.location.hash;
    activeHash.value = routeName.slice(1) || '/';
    activeRoute.value = routes[activeHash.value];
    queryParameters.value = routeWithQueryParameters ? new URLSearchParams(routeWithQueryParameters[2]) : null;
};

window.addEventListener('hashchange', selectRoute);

selectRoute();
