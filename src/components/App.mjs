import { css } from "../deps/goober.mjs";
import Header from "./Header.mjs";
import { activeRoute, queryParametersObject } from "../services/routes.mjs";
import ProgrammaticModals from "./ProgrammaticModals.mjs";

const styles = css`
`;

export default {
    components: { Header, ProgrammaticModals },
    data: () => ({ activeRoute, queryParametersObject }),
    template: `<div class="page ${styles}">
        <Header />
        <main class="page-wrapper">
            <component :is="activeRoute" v-bind="queryParametersObject" />
        </main>
        <ProgrammaticModals />
    </div>`,
}