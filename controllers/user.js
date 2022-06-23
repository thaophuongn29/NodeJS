const Attendance = require("../model/attendance");
const User = require("../model/user");
const Covid = require("../model/covid");
const AnnualLeave = require("../model/annualLeave");
const moment = require("moment");
const fs = require("fs");

exports.getAttendance = (req, res) => {
  const date = moment().format("L");
  const time = moment().format();
  getTotalHours(time, req.user._id)
    .then((totalHours) => {
      Attendance.find({ userId: req.user._id, date: date })
        .sort({ checkinTime: 1 })
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
            date: moment(date, "MM/DD/YYYY").format("DD/MM/YYYY"),
          });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

// Diem danh
exports.postAttendance = (req, res) => {
  const _id = req.body._id;
  const place = req.body.place;
  const state = req.body.state;
  const date = moment().format("L");
  const time = moment().format();

  // Da checkout
  if (state === "false") {
    return Attendance.findById(_id)
      .then((info) => {
        const a = moment(info.checkinTime);
        const b = moment(time);

        const hours = b.diff(a, "minutes");

        info.checkoutTime = time;
        info.state = state;
        info.hours = (hours / 60).toFixed(2);

        return info.save();
      })
      .then(() => res.redirect("/"))
      .catch((err) => console.log(err));
  } else {
    // Checkin
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

// Dang ki nghi
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
        date: moment(date).format("L"),
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
    doB: moment(req.user.doB).format("DD-MM-YYYY"),
    startDate: moment(req.user.startDate).format("DD-MM-YYYY"),
  });
};

// post anh
exports.postUser = (req, res, next) => {
  fs.unlink(req.user.image, (err) => {
    if (err) {
      throw err;
    }
  });
  req.user.image = req.file.path;
  req.user
    .save()
    .then(() => res.redirect("/user"))
    .catch((err) => next(err));
};

exports.getCovid = (req, res, next) => {
  // quan li dang nhap
  if (req.session.isLoggedIn.manager) {
    return Covid.find()
      .populate("userId")
      .then((users) => {
        users = users.filter(
          (user) =>
            user.userId.manager.toString() === req.session.user._id.toString()
        );
        return res.render("covid", {
          pageTitle: "Covid",
          path: "/covid",
          users: users,
        });
      })
      .catch((err) => next(err));
  }
  // nhan vien dang nhap
  res.render("covid", {
    pageTitle: "Covid",
    path: "/covid",
  });
};

exports.postCovid = (req, res, next) => {
  Covid.findOne({ userId: req.user._id })
    .then((covid) => {
      if (!covid) {
        if (req.body.temperature) {
          const new_covid = new Covid({
            userId: req.user._id,
            register: {
              temperature: req.body.temperature,
              date: moment(req.body.date).format("DD/MM/YYYY"),
              time: req.body.time,
            },
          });
          return new_covid.save();
          // form dang ki vaccine
        } else if (req.body.vaccine1) {
          const new_covid = new Covid({
            userId: req.user._id,
            vaccines: {
              vaccine1: {
                name: req.body.vaccine1,
                date: moment(req.body.dateVaccine1).format("DD/MM/YYYY"),
              },
              vaccine2: {
                name: req.body.vaccine2,
                date: moment(req.body.dateVaccine2).format("DD/MM/YYYY"),
              },
            },
          });
          return new_covid.save();
          // form duong tinh
        } else if (req.body.negative) {
          const new_covid = new Covid({
            userId: req.user._id,
            negative: req.body.negative,
          });
          return new_covid.save();
        }
      }
      // form dang ki than nhiet
      if (req.body.temperature) {
        covid.register.temperature = req.body.temperature;
        covid.register.date = moment(req.body.date).format("DD/MM/YYYY");
        covid.register.time = req.body.time;
        return covid.save();
        // form dang ki vaccine
      } else if (req.body.vaccine1) {
        covid.vaccines.vaccine1.name = req.body.vaccine1;
        covid.vaccines.vaccine1.date = moment(req.body.dateVaccine1).format(
          "DD/MM/YYYY"
        );
        covid.vaccines.vaccine2.name = req.body.vaccine2;
        covid.vaccines.vaccine2.date = moment(req.body.dateVaccine2).format(
          "DD/MM/YYYY"
        );
        return covid.save();
        // form duong tinh
      } else if (req.body.negative) {
        covid.negative = req.body.negative;
        return covid.save();
      }
    })
    .then(res.redirect("/covid"))
    .catch((err) => next(err));
};

exports.getDetail = (req, res, next) => {
  const date = req.query.day
    ? moment(req.query.day).format("L")
    : moment().format("L");
  const month = req.query.month ? req.query.month : moment().month() + 1;
  const year = moment().year();

  // pagination
  let perPage = 3;
  let page = req.params.page || 1;
  let count;

  Attendance.find({ userId: req.user._id, date: date })
    .countDocuments()
    .then((num) => {
      count = num;
      return Attendance.find({ userId: req.user._id, date: date })
        .sort({ date: 1 })
        .skip(perPage * page - perPage)
        .limit(perPage);
    })
    .then((users) => {
      getSalary(month, req.user).then((salary) => {
        getTotalHours(moment(date, "MM-DD-YYYY").format(), req.user._id).then(
          (totalHours) => {
            req.user
              .populate("manager")
              .then((user) => {
                res.render("detail", {
                  pageTitle: "Chi tiet",
                  path: "/detail",
                  users: users,
                  user: user,
                  salary: salary === "NaN" ? "Khong co thong tin" : salary,
                  month: month,
                  date,
                  year,
                  totalHours,
                  state: users.length ? users[users.length - 1].state : "false",
                  overTime:
                    totalHours - 8 > 0 ? (totalHours - 8).toFixed(2) : 0,

                  current: page, // page hiện tại
                  pages: Math.ceil(count / perPage), // tổng số các page
                });
              })
              .catch((err) => next(err));
          }
        );
      });
    })
    .catch((err) => next(err));
};

function getSalary(month, user) {
  let totalHours = 0;
  let date = "";
  return Attendance.find({ userId: user._id, month: month })
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

function getTotalHours(day, userId) {
  let totalHours = 0;
  return Attendance.find({ userId, date: moment(day).format("L") })
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
