import { ref } from "../deps/vue.mjs";
import Viewer from "../pages/Viewer.mjs";
import Generator from "../pages/Generator.mjs";
import { rotaMembers } from "./data.mjs";

export const routes = {
    '/': Viewer,
    '/old': Generator,
};

export const routeMap = new WeakMap();
for (const route in routes) {
    routeMap.set(routes[route], route);
}

export const getRoute = (component) => '#' + (routeMap.get(component) || '/');

export const activeHash = ref(window.location.hash.slice(1) || '/');
export const activeRoute = ref(routes[activeHash.value]);

window.addEventListener('hashchange', () => {
    activeHash.value = window.location.hash.slice(1) || '/';
    activeRoute.value = routes[activeHash.value];
});

if (rotaMembers.value.length === 0) window.location.hash = '/configure';