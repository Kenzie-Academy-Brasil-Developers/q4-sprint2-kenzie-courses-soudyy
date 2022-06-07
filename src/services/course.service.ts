import { Request } from "express";
import { courseRepository, userRepository } from "../repositories";
import { AssertsShape } from "yup/lib/object";
import { Course, User } from "../entities";
import {
  serializedAdminCoursesSchema,
  serializedCourseSchema,
  serializedStudentsCoursesSchema,
} from "../schemas";
import transport from "../config/mailer.config";
import { ErrorHandler, errorHandler } from "../errors/errors";

import * as dotenv from "dotenv";

dotenv.config();

class CourseService {
  createCourse = async ({ validated }: Request): Promise<AssertsShape<any>> => {
    const course = await courseRepository.save(validated as Course);
    return await serializedCourseSchema.validate(course, {
      stripUnknown: true,
    });
  };

  readAllCourses = async ({ decoded }): Promise<AssertsShape<any>> => {
    let newList = [];
    const courses = await courseRepository.listAll();
    const loggedUser = await userRepository.retrieve({ id: decoded.id });
    if (loggedUser.isAdm) {
      for (const element of courses) {
        newList.push({
          id: element.id,
          courseName: element.courseName,
          duration: element.duration,
          students: await element.students,
        });
      }
      return await serializedAdminCoursesSchema.validate(newList, {
        stripUnknown: true,
      });
    }
    return await serializedStudentsCoursesSchema.validate(courses, {
      stripUnknown: true,
    });
  };

  updateCourse = async ({ validated, params }): Promise<AssertsShape<any>> => {
    const course = await courseRepository.update(params.id, {
      ...(validated as Course),
    });
    const updatedCourse = await courseRepository.retrieve({ id: params.id });
    return await serializedCourseSchema.validate(updatedCourse, {
      stripUnknown: true,
    });
  };

  addStudent = async (data) => {
    const user = await userRepository.retrieve({ id: data.decoded.id });
    const course = await courseRepository.retrieve({ id: data.params.id });

    if (!course) {
      throw new ErrorHandler(400, "Missing or wrong course id");
    }

    user.courses = [course];

    await userRepository.save(user);
    console.log(process.env.NODEMAILER_HOST);
    console.log(process.env.NODEMAILER_TO);

    const mailOptions = {
      from: process.env.NODEMAILER_FROM,
      to: process.env.NODEMAILER_TO,
      subject: "Inscrição concluida",
      text: `Bem vindo ao curso de ${course.courseName} com a duração de ${course.duration}`,
    };
    transport.sendMail(mailOptions, (err) => {
      console.log(mailOptions);
      if (err) {
        throw new ErrorHandler(400, "Something wrong happens, email not send");
      }
    });
  };
}

export default new CourseService();
