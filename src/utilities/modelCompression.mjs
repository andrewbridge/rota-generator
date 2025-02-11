import { createMember, createRole } from "../models.mjs";

/** @typedef {import('../types').Configuration} Configuration */

const compressionMap = [
    "uid",
    "name",
    "members",
    "roles",
    "avoidanceRule",
    "numberOfWeeks"
];

const modelMaps = {
    members: [
        "name",
        "days"
    ],
    roles: [
        "name",
        "members",
        "requiredPerDay"
    ],
};

export const objectToArray = (object, map) => {
    const array = [];
    for (const key of map) {
        array.push(object[key]);
    }
    return array;
}

export const arrayToObject = (array, map) => {
    const object = {};
    for (const [index, key] of map.entries()) {
        object[key] = array[index];
    }
    return object;
}

/** @type {(configuration: Configuration) => Promise<string>} */
export const compress = async (data) => {
    const membersMap = new Map();
    const membersArray = data.members.map((member, index) => {
        membersMap.set(member.id, index);
        return objectToArray(member, modelMaps.members)
    });
    const rolesArray = data.roles.map((role) => {
        const dupeRole = {
            ...role,
            members: role.members.map((memberId) => membersMap.get(memberId)),
        }
        return objectToArray(dupeRole, modelMaps.roles)
    });
    const dupeData = {
        ...data,
        members: membersArray,
        roles: rolesArray,
    };
    const array = [];
    for (const key of compressionMap) {
        array.push(dupeData[key]);
    }
    const { compressToEncodedURIComponent } = await import('../deps/lz-string.mjs');
    return compressToEncodedURIComponent(JSON.stringify(array));
}

/** @type {(compressedData: string) => Promise<Configuration>} */
export const decompress = async (compressedData) => {
    const { decompressFromEncodedURIComponent } = await import('../deps/lz-string.mjs');
    const array = JSON.parse(decompressFromEncodedURIComponent(compressedData));
    const data = {};
    let members = null;
    for (const [index, key] of compressionMap.entries()) {
        if (typeof array[index] !== 'object' || array[index] === null) {
            data[key] = array[index];
            continue;
        }
        if (key === 'members') {
            members = array[index].map((memberArray) => {
                const dataObject = arrayToObject(memberArray, modelMaps.members);
                return createMember(dataObject.name, dataObject.days);
            });
            data[key] = members;
        } else if (key === 'roles') {
            const roles = array[index].map((roleArray) => {
                const dataObject = arrayToObject(roleArray, modelMaps.roles);
                const roleMembers = dataObject.members.map((memberIndex) => members[memberIndex]);
                return createRole(dataObject.name, roleMembers, dataObject.requiredPerDay);
            });
            data[key] = roles;
        }
    }
    return data;
}