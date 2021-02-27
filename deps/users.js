const devID = "DEVELOPER_USER_ID"; // Nick's User ID

function User(id, name, tag, title, email) {
    this.name = name;
    this.tag = tag;
    this.title = title;
    this.email = email;
};

var staffUsers = [
];

var supportUsers = [
]

var studentUsers = [
];

exports.staffUsers = staffUsers;
exports.supportUsers = supportUsers;
exports.studentUsers = studentUsers;
exports.devID = devID;