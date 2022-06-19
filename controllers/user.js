const Attendance = require("../model/attendance");
const User = require("../model/user");
const Covid = require("../model/covid");
const AnnualLeave = require("../model/annualLeave");
const moment = require("moment"); // require

exports.getAttendance = (req, res) => {
  const date = moment().format("L");
  const time = moment().format();
  getTotalHours(time)
    .then((totalHours) => {
      Attendance.find({ date: date })
        .then((info) => {
          const index = info.length - 1;
          res.render("attendance", {
            pageTitle: "Diem danh",
            path: "/",
            user: req.user,
            state: info.length > 0 ? info[index].state : "false",
            lastInfo: info.length > 0 ? info[index] : {},
            info: info,
            totalHours: totalHours,
            date,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postAttendance = (req, res) => {
  console.log(req.body);
  const _id = req.body._id;
  const place = req.body.place;
  const state = req.body.state;
  const date = moment().format("L");
  const time = moment().format();

  if (state === "false") {
    return Attendance.findById(_id)
      .then((info) => {
        const a = moment(info.checkinTime);
        const b = moment(time);

        const hours = b.diff(a, "minutes");

        info.checkoutTime = time;
        info.state = state;
        info.hours = (hours / 60).toFixed(2);
        console.log(info);
        return info.save();
      })
      .then(() => res.redirect("/"))
      .catch((err) => console.log(err));
  } else {
    const attendance = new Attendance({
      userId: req.user,
      place,
      checkinTime: time,
      checkoutTime: "",
      date,
      state,
      hours: 0,
      month: moment(time).month() + 1,
    });
    attendance
      .save()
      .then(() => res.redirect("/"))
      .catch((err) => console.log(err));
  }
};

exports.postAnnualLeave = (req, res) => {
  const date = req.body.date;
  const days = req.body.days ? +req.body.days : 0;
  const hours = req.body.hours ? +req.body.hours : 0;
  User.findById(req.user._id)
    .then((user) => {
      user.annualLeave = user.annualLeave - days - (hours / 8).toFixed(2);
      return user.save();
    })
    .then(() => {
      const annualLeave = new AnnualLeave({
        userId: req.user,
        annualLeave: days + +(hours / 8).toFixed(2),
        month: moment(date).month() + 1,
      });
      return annualLeave.save();
    })
    .then(() => res.redirect("/"))
    .catch((err) => console.log(err));
};

exports.getUser = (req, res) => {
  res.render("userInfo", {
    pageTitle: "Thong tin",
    path: "/user",
    user: req.user,
    edit: req.query.edit,
    doB: moment(req.user.doB).format("L"),
    startDate: moment(req.user.startDate).format("L"),
  });
};

exports.postUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      user.image = req.body.image;
      return user.save();
    })
    .then(() => {
      res.redirect("/user");
    })
    .catch((err) => console.log(err));
};

exports.getCovid = (req, res) => {
  res.render("covid", {
    pageTitle: "Covid",
    path: "/covid",
  });
};

exports.postCovid = (req, res) => {
  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
      if (req.body.temperature) {
        covid.register.temperature = req.body.temperature;
        covid.register.date = req.body.date;
        covid.register.time = req.body.time;
        return covid.save();
      } else if (req.body.vaccine1) {
        covid.vaccines[0].name = req.body.vaccine1;
        covid.vaccines[0].date = req.body.dateVaccine1;
        covid.vaccines[1].name = req.body.vaccine2;
        covid.vaccines[1].date = req.body.dateVaccine2;
        return covid.save();
      } else if (req.body.negative) {
        covid.negative = req.body.negative;
        return covid.save();
      }
    })
    .then(res.redirect("/covid"))
    .catch((err) => console.log(err));
};

exports.getDetail = (req, res) => {
  // const time = moment().format();
  const date = req.query.day
    ? moment(req.query.day).format("L")
    : moment().format("L");
  const month = req.query.month ? req.query.month : moment().month() + 1;
  const year = moment().year();
  Attendance.find({ userId: req.user._id }).then((users) => {
    const newUsers = users.filter((user) => user.date === date);
    getSalary(month, req.user).then((salary) => {
      getTotalHours(moment(date, "MM-DD-YYYY").format())
        .then((totalHours) => {
          res.render("detail", {
            pageTitle: "Chi tiet",
            path: "/detail",
            users: newUsers,
            user: req.user,
            salary: salary === "NaN" ? "Khong co thong tin" : salary,
            month: month,
            date,
            year,
            totalHours,
            state: users[users.length - 1].state,
            overTime: totalHours - 8 > 0 ? (totalHours - 8).toFixed(2) : 0,
          });
        })
        .catch((err) => console.log(err));
    });
  });
};

function getSalary(month, user) {
  let totalHours = 0;
  let date = "";
  return Attendance.find({ month: month })
    .then((users) => {
      users.forEach((user) => {
        totalHours += user.hours;
        date = user.checkinTime;
      });
      return moment(date).daysInMonth();
    })
    .then((daysInMonth) => {
      return AnnualLeave.find({ userId: user._id })
        .then((items) => {
          let sum = 0;
          items.forEach((item) => (sum += item.annualLeave));
          const overTime = totalHours - daysInMonth * 8;
          const salary = (
            user.salaryScale * 3000000 +
            (overTime + sum) * 200000
          ).toFixed();
          if (salary < 0) {
            return 0;
          } else {
            return salary;
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function getTotalHours(day) {
  let totalHours = 0;
  return Attendance.find({ date: moment(day).format("L") })
    .then((users) => {
      if (users) {
        users.forEach((user) => (totalHours += user.hours));
        return totalHours.toFixed(2);
      } else {
        return null;
      }
    })
    .catch((err) => console.log(err));
}
