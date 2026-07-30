const { classifyParticipant } = require("./skillClassifier");

function calculateTeamScore(teamMembers) {

    let score = 0;

    const categories = new Set();

    const interests = [];

    let beginner = 0;
    let intermediate = 0;
    let advanced = 0;

    for (const member of teamMembers) {

        categories.add(classifyParticipant(member));

        if (member.interests) {

            try {

                const parsed = Array.isArray(member.interests)
                    ? member.interests
                    : JSON.parse(member.interests);

                interests.push(...parsed);

            } catch {}
        }

        switch ((member.experience_level || "").toLowerCase()) {

            case "beginner":
                beginner++;
                break;

            case "intermediate":
                intermediate++;
                break;

            case "advanced":
                advanced++;
                break;
        }
    }

    // ---------- Skill Diversity (40) ----------
    score += Math.min(categories.size * 10, 40);

    // ---------- Experience Balance (20) ----------
    if (beginner && intermediate)
        score += 10;

    if (advanced)
        score += 10;

    // ---------- Interest Match (20) ----------
    const uniqueInterests = new Set(interests);

    if (interests.length > 0) {

        const overlap =
            interests.length - uniqueInterests.size;

        score += Math.min(overlap * 5, 20);
    }

    // ---------- Ideal Team Size (20) ----------
    if (teamMembers.length === 4)
        score += 20;
    else if (teamMembers.length === 3)
        score += 15;
    else
        score += 10;

    return Math.min(score, 100);
}

module.exports = {
    calculateTeamScore
};