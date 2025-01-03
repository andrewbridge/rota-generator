import RotaMemberConfiguration from "../components/RotaMemberConfiguration.mjs";
import {css} from "../deps/goober.mjs";
import { memberMap, rotaMembers } from "../services/data.mjs";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const generateRota = (peoplePerDay) => {
    const rota = {};
    const allocationCount = new Map();

    // Initialize allocation count for each member
    rotaMembers.value.forEach(member => {
        allocationCount.set(member.id, 0);
    });

    // Iterate through each day of the week (0-6)
    for (let day = 1; day < 6; day++) {
        const availableMembers = rotaMembers.value.filter(member => member.days.includes(String(day)));
        
        // Sort available members by the number of times they have been allocated
        availableMembers.sort((a, b) => allocationCount.get(a.id) - allocationCount.get(b.id));

        // Allocate members to the rota for the current day
        rota[days[day]] = availableMembers.slice(0, peoplePerDay).map(member => {
            allocationCount.set(member.id, allocationCount.get(member.id) + 1);
            return member.id;
        });
    }

    return rota;
};

const styles = css``;

export default {
    name: 'Generator',
    components: { RotaMemberConfiguration },
    data: () => ({ memberMap, rotaMembers, numberOfPeople: 1, results: null }),
    methods: {
        generate(event) {
            // const data = new FormData(event.target);
            this.results = generateRota(this.numberOfPeople);
        }
    },
    template: `<div class="page-header">
        <div class="container-xl">
            <div class="row g-2 align-items-center">
                <div class="col">
                    <h2 class="page-title">
                        Generate rota
                    </h2>
                </div>
            </div>
        </div>
    </div>
    <!-- Page body -->
    <div class="page-body ${styles}">
        <div class="container-xl">
            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Configure rota</h3>
                        </div>
                        <form @submit.prevent="generate">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <RotaMemberConfiguration />
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label class="form-label required">Number of people on each day</label>
                                            <input type="number" class="form-control" name="number-on-rota" placeholder="Number of people" min="1" :max="rotaMembers.length" v-model="numberOfPeople">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer text-end">
                                <button class="btn btn-primary" type="submit">Generate</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="col-12" v-if="results !== null">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Rota Results</h3>
                        </div>
                        <div class="card-body table-responsive">
                            <table class="table table-vcenter card-table">
                                <thead>
                                    <tr>
                                        <th>Member</th>
                                        <th v-for="staff, day in results" :key="day">{{ day }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="member in rotaMembers" :key="member.id">
                                        <td>{{ member.name }}</td>
                                        <td v-for="staff, day in results" :key="day">
                                            <span v-if="results[day] && results[day].includes(member.id)">✓</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
}
