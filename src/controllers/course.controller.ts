import { Request, Response } from "express";
import { courseService } from "../services";
import * as dotenv from "dotenv";
dotenv.config();
class CourseController {
  createCourse = async (req: Request, res: Response) => {
    const course = await courseService.createCourse(req);
    return res.status(201).json(course);
  };

  readAll = async (req: Request, res: Response) => {
    const courses = await courseService.readAllCourses(req);
    return res.status(200).json(courses);
  };

  updateCourse = async (req: Request, res: Response) => {
    const course = await courseService.updateCourse(req);
    return res.status(200).json(course);
  };
  addStudent = async (req: Request, res: Response) => {
    const student = await courseService.addStudent(req);
    console.log(process.env.PINTASSILGO);
    return res
      .status(200)
      .json({ message: "Email de inscrição enviado com sucesso." });
  };
}

export default new CourseController();
