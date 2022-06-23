const User = require("../model/user");
const Attendance = require("../model/attendance");
const AnnualLeave = require("../model/annualLeave");
const moment = require("moment");
const Covid = require("../model/covid");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

exports.getConfirm = (req, res, next) => {
  User.find({ manager: req.user._id })
    .then((users) => {
      res.render("confirm", {
        pageTitle: "Xac nhan gio lam",
        path: "/confirm",
        users: users,
        info: undefined,
      });
    })
    .catch((err) => next(err));
};

// Chuyen trang thai nhan vien
exports.postConfirm = (req, res, next) => {
  const confirm = req.body.confirm === "true" ? true : false;
  const userId = req.body.userId;
  User.findById(userId)
    .then((user) => {
      user.confirm = confirm;
      return user.save();
    })
    .then(() => res.redirect(`/confirm/${userId}`))
    .catch((err) => next(err));
};

// Gio lam nhan vien theo userId
exports.getUser = (req, res, next) => {
  const month = req.query.month ? req.query.month : null;

  // Tim nguoi dung theo id quan li
  User.find({ manager: req.user._id })
    .then((users) => {
      // Tim danh sach diem danh theo id nhan vien
      Attendance.find({ userId: req.params.userId })
        .sort({ date: 1 })
        .then((info) => {
          // Tim ngay nghi cua nhan vien theo id
          AnnualLeave.find({ userId: req.params.userId })
            .then((annualLeave) => {
              if (month) {
                info = info.filter((i) => i.month == month);
              }

              // Them annualeave vao ngay da dang ki nghi
              const new_info = [];
              info.forEach((i, index) => {
                new_info.push(i);
                annualLeave.forEach((a) => {
                  if (i.date === a.date) {
                    new_info[index] = { ...i._doc, annualLeave: a.annualLeave };
                  }
                });
              });
              info = new_info;

              const user = users.find(
                (user) => user._id.toString() === req.params.userId.toString()
              );

              res.render("confirm", {
                pageTitle: "Xac nhan gio lam",
                path: "/confirm",
                users: users,
                info: info,
                user: user,
                month: month,
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.postDeleteData = (req, res, next) => {
  const id = req.body.id;
  const userId = req.params.userId;
  Attendance.deleteOne({ _id: id })
    .then(() => {
      res.redirect(`/confirm/${userId}`);
    })
    .catch((err) => next(err));
};

exports.getCovidPdf = (req, res, next) => {
  const userId = req.params.userId;
  const pdfName = "covid-" + userId + ".pdf";
  const pdfPath = path.join("data", "covid", pdfName);
  const pdfDoc = new PDFDocument();

  Covid.findOne({ userId })
    .populate("userId", "name")
    .then((user) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + pdfName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(pdfPath));
      pdfDoc.pipe(res);

      if (user.register.temperature) {
        pdfDoc.fontSize(24).text("Thong tin covid nhan vien");
        pdfDoc.text(" ");
        pdfDoc.fontSize(16).text("Ho va ten: " + user.userId.name);
        pdfDoc.text(
          "Nhiet do than the: " +
            user.register.temperature +
            "°C" +
            ", ngay: " +
            user.register.date +
            ", luc: " +
            user.register.time
        );
      }

      if (user.vaccines.vaccine1.name) {
        pdfDoc.text(
          "Vaccine mui 1: " +
            user.vaccines.vaccine1.name +
            ", tiem ngay: " +
            user.vaccines.vaccine1.date
        );
        pdfDoc.text(
          "Vaccine mui 2: " +
            user.vaccines.vaccine2.name +
            ", tiem ngay: " +
            user.vaccines.vaccine2.date
        );
      }

      let negative;
      if (user.negative === false) {
        negative = "Khong";
      } else {
        negative = "Co";
      }
      pdfDoc.text("Duong tinh: " + negative);

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
