import { css } from "../deps/goober.mjs";
import { ConfigurationExistsError } from "../errors.mjs";
import { addConfigurationFromShare } from "../services/configurations.mjs";

const styles = css``;

export default {
    name: 'Importer',
    props: {
        configuration: String,
    },
    data: () => ({ error: null }),
    async created() {
        // Handle instances where the configuration prop is not present
        if (!this.configuration) {
            this.setImportError();
            return;
        }
        // Add the configuration from the string
        try {
            await this.addConfigurationWithOverwritePrompt();
            window.location.hash = '';
        } catch (error) {
            this.setImportError();
            console.debug(error);
        }
    },
    methods: {
        async addConfigurationWithOverwritePrompt() {
            let retryWithPrompt = false;
            try {
                await addConfigurationFromShare(this.configuration);
            } catch (error) {
                if (!(error instanceof ConfigurationExistsError)) {
                    throw error;
                }
                retryWithPrompt = true;
            }

            if (retryWithPrompt) {
                const overwrite = confirm('This configuration already exists, overwrite existing configuration?')
                await addConfigurationFromShare(this.configuration, overwrite);
            }
        },
        setImportError() {
            this.error = {
                title: 'An error occurred',
                message: 'The configuration could not be imported.',
            }
        },
    },
    template: /*html*/`
        <div class="page-body ${styles}">
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="text-center py-4" v-if="error">
                                    <!-- Download SVG icon from http://tabler.io/icons/icon/alert-triangle -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon mb-2 text-danger icon-lg"><path d="M12 9v4"></path><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"></path><path d="M12 16h.01"></path></svg>
                                    <h3>{{error.title}}</h3>
                                    <div class="text-secondary">{{error.message}}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
}