function GoalCard(text, otherwiseText, goals, otherwiseGoals){
    this.text = text;
    this.otherwiseText = otherwiseText;
    this.goals = goals;
    this.otherwiseGoals = otherwiseText;
}

GoalCard.prototype = {
    text : null,
    otherwiseText : null,
    goals : [],
    otherwiseGoals : [],

    getText : function (){
        return null
    },
    getOtherwiseText : function () {
        return null
    },
    getGoals : function () {
        return null
    },
    getOtherwiseGoals: function () {
        return null
    },
}