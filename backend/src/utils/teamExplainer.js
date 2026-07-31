function generateTeamExplanation(teamMembers) {

    const names = [];
    const skills = [];
    const interests = [];

    teamMembers.forEach(member => {

        names.push(member.name);

        try {
            const memberSkills = Array.isArray(member.skills)
                ? member.skills
                : JSON.parse(member.skills || "[]");

            skills.push(...memberSkills);

        } catch {}

        try {
            const memberInterests = Array.isArray(member.interests)
                ? member.interests
                : JSON.parse(member.interests || "[]");

            interests.push(...memberInterests);

        } catch {}

    });

    const uniqueSkills = [...new Set(skills)].slice(0, 5);
    const uniqueInterests = [...new Set(interests)].slice(0, 3);

    return `This team combines ${names.join(", ")}. Together they bring expertise in ${uniqueSkills.join(", ")}. They also share interests in ${uniqueInterests.join(", ")}, making them well suited to collaborate on a hackathon project.`;
}

module.exports = {
    generateTeamExplanation
};