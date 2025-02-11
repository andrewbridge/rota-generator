import { AVOIDANCE_RULES } from '../constants.mjs';

/**
 * @typedef {import('../types').DAYS} DAYS
 * @typedef {import('../types').Configuration} Configuration
 * @typedef {import('../types').Rota} Rota
 * @typedef {import('../types').Member} Member
 */

/** @type {DAYS} */
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** @type {(members: Member[]) => Map<string, Member>} */
const createMemberMap = (members) => {
    const map = new Map();
    for (const rotaMember of members) {
        map.set(rotaMember.id, rotaMember);
    }
    return map;
}

/** @type {(configuration: Configuration) => Rota[]} */
export const generateRotas = ({
    numberOfWeeks,
    members: rotaMembers,
    roles: rotaRoles,
    avoidanceRule
}) => {
    const rotas = [];
    const allocationCount = new Map();
    const memberMap = createMemberMap(rotaMembers);

    for (let i = 0; i < numberOfWeeks; i++) {
        const rota = {};

        // Initialize rota day data
        for (const day of days) {
            rota[day] = {};
        }

        // Initialize allocation count for each member
        for (const member of rotaMembers) {
            allocationCount.set(member.id, 0);
        }

        const filteredMembersByDay = days.reduce((acc, _, index) => {
            acc[index] = rotaMembers.filter(member => member.days.includes(String(index)));
            return acc;
        }, {});

        const sortedDaysByAvailability = days
            .map((_, index) => ({
                day: index,
                availableMembers: filteredMembersByDay[index].length
            }))
            .filter(day => day.availableMembers > 0)
            .sort((a, b) => a.availableMembers - b.availableMembers)
            .map(({ day }) => day);

        // Iterate through each day of the week (0-6)
        for (const day of sortedDaysByAvailability) {
            const dayInPreviousWeeks = rotas.map(rota => rota[days[day]]);
            const membersAvailableForDay = filteredMembersByDay[day];

            if (membersAvailableForDay.length === 0) {
                continue;
            }

            const unavailableMembersForDay = new Set();
            for (const role of rotaRoles) {
                const avoidMembersForRole = new Set();
                switch (avoidanceRule) {
                    case AVOIDANCE_RULES.AVOID_CONSECUTIVE_ROLES:
                        // From rotas, get the rota object for the current day and add all members with the current role to unavailableMembersForRole
                        for (const previousDay of dayInPreviousWeeks) {
                            Object.keys(previousDay).forEach(memberId => {
                                if (previousDay[memberId] === role.id) {
                                    avoidMembersForRole.add(memberId);
                                }
                            });
                        }
                        break;
                    case AVOIDANCE_RULES.AVOID_CONSECUTIVE_SHIFTS:
                        const dayInPreviousWeek = dayInPreviousWeeks.at(-1);
                        if (!dayInPreviousWeek) {
                            break;
                        }
                        Object.keys(dayInPreviousWeek).forEach(memberId => {
                            avoidMembersForRole.add(memberId);
                        });
                        break;
                    case AVOIDANCE_RULES.AVOID_DUPLICATE_SHIFTS:
                        dayInPreviousWeeks.forEach(dayInPreviousWeek => {
                            Object.keys(dayInPreviousWeek).forEach(memberId => {
                                avoidMembersForRole.add(memberId);
                            });
                        });
                        break;
                }
                // Sort available members by the number of times they have been allocated
                membersAvailableForDay.sort((a, b) => allocationCount.get(a.id) - allocationCount.get(b.id));
                const membersForRole = membersAvailableForDay.filter(member => role.members.includes(member.id) && !unavailableMembersForDay.has(member.id) && !avoidMembersForRole.has(member.id));

                // Group memberAvailableForDay into an array of arrays grouped by allocationCount
                const groupedMembers = [];
                let currentGroup = [];
                if (membersForRole.length > 0) {
                    let currentAllocationCount = allocationCount.get(membersForRole[0].id);
                    for (const member of membersForRole) {
                        if (allocationCount.get(member.id) !== currentAllocationCount) {
                            groupedMembers.push(currentGroup);
                            currentGroup = [];
                            currentAllocationCount = allocationCount.get(member.id);
                        }
                        currentGroup.push(member);
                    }
                }

                if (currentGroup.length > 0) {
                    groupedMembers.push(currentGroup);
                    currentGroup = [];
                }

                // We are avoiding these members rather than removing them from the chance of being allocated
                // Put them at the end of the list of possible allocations
                for (const memberId of Array.from(avoidMembersForRole).reverse()) {
                    if (!unavailableMembersForDay.has(memberId)) {
                        currentGroup.push(memberMap.get(memberId));
                    }
                }

                if (currentGroup.length > 0) {
                    if (avoidanceRule === AVOIDANCE_RULES.AVOID_DUPLICATE_SHIFTS) {
                        // If we are avoiding duplicate shifts, sort the group so that, if we have to assign a
                        // previously allocated member, we assign the one that was allocated the longest time ago
                        currentGroup.sort((a, b) => {
                            const aIndex = dayInPreviousWeeks.findIndex(day => day[a.id]);
                            const bIndex = dayInPreviousWeeks.findIndex(day => day[b.id]);
                            if (aIndex === -1) {
                                return 1;
                            }
                            if (bIndex === -1) {
                                return -1;
                            }
                            return aIndex - bIndex;
                        });
                    }
                    groupedMembers.push(currentGroup);
                    currentGroup = [];
                }

                let allocatedToRole = 0;
                while (allocatedToRole < role.requiredPerDay && groupedMembers.length > 0) {
                    // Randomly take an item from the first array in groupedMembers
                    const randomIndex = Math.floor(Math.random() * groupedMembers[0].length);
                    const randomMember = groupedMembers[0].splice(randomIndex, 1)[0];
                    rota[days[day]][randomMember.id] = role.id;
                    unavailableMembersForDay.add(randomMember.id);
                    allocationCount.set(randomMember.id, allocationCount.get(randomMember.id) + 1);
                    allocatedToRole++;
                    if (groupedMembers[0].length === 0) {
                        groupedMembers.shift();
                    }
                }
            }
        }

        rotas.push(rota);
    }

    return rotas;
};