function validateTeams(teams, profiles) {
    if (!Array.isArray(teams)) {
        return false;
    }

    const profileIds = profiles.map(p => p.id);

    const assigned = [];

    for (const team of teams) {

        if (!Array.isArray(team.member_ids)) {
            return false;
        }

        for (const id of team.member_ids) {

            // duplicate member
            if (assigned.includes(id)) {
                return false;
            }

            // unknown member
            if (!profileIds.includes(id)) {
                return false;
            }

            assigned.push(id);
        }
    }

    // every participant must be assigned
    return assigned.length === profileIds.length;
}

module.exports = {
    validateTeams
};