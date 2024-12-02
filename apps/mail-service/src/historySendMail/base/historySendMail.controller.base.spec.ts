import { Test } from "@nestjs/testing";
import {
  INestApplication,
  HttpStatus,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import request from "supertest";
import { ACGuard } from "nest-access-control";
import { DefaultAuthGuard } from "../../auth/defaultAuth.guard";
import { ACLModule } from "../../auth/acl.module";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { map } from "rxjs";
import { HistorySendMailController } from "../historySendMail.controller";
import { HistorySendMailService } from "../historySendMail.service";

const nonExistingId = "nonExistingId";
const existingId = "existingId";
const CREATE_INPUT = {
  body: "exampleBody",
  createdAt: new Date(),
  email: "exampleEmail",
  id: "exampleId",
  sentAt: new Date(),
  subject: "exampleSubject",
  updatedAt: new Date(),
};
const CREATE_RESULT = {
  body: "exampleBody",
  createdAt: new Date(),
  email: "exampleEmail",
  id: "exampleId",
  sentAt: new Date(),
  subject: "exampleSubject",
  updatedAt: new Date(),
};
const FIND_MANY_RESULT = [
  {
    body: "exampleBody",
    createdAt: new Date(),
    email: "exampleEmail",
    id: "exampleId",
    sentAt: new Date(),
    subject: "exampleSubject",
    updatedAt: new Date(),
  },
];
const FIND_ONE_RESULT = {
  body: "exampleBody",
  createdAt: new Date(),
  email: "exampleEmail",
  id: "exampleId",
  sentAt: new Date(),
  subject: "exampleSubject",
  updatedAt: new Date(),
};

const service = {
  createHistorySendMail() {
    return CREATE_RESULT;
  },
  historySendMails: () => FIND_MANY_RESULT,
  historySendMail: ({ where }: { where: { id: string } }) => {
    switch (where.id) {
      case existingId:
        return FIND_ONE_RESULT;
      case nonExistingId:
        return null;
    }
  },
};

const basicAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const argumentHost = context.switchToHttp();
    const request = argumentHost.getRequest();
    request.user = {
      roles: ["user"],
    };
    return true;
  },
};

const acGuard = {
  canActivate: () => {
    return true;
  },
};

const aclFilterResponseInterceptor = {
  intercept: (context: ExecutionContext, next: CallHandler) => {
    return next.handle().pipe(
      map((data) => {
        return data;
      })
    );
  },
};
const aclValidateRequestInterceptor = {
  intercept: (context: ExecutionContext, next: CallHandler) => {
    return next.handle();
  },
};

describe("HistorySendMail", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: HistorySendMailService,
          useValue: service,
        },
      ],
      controllers: [HistorySendMailController],
      imports: [ACLModule],
    })
      .overrideGuard(DefaultAuthGuard)
      .useValue(basicAuthGuard)
      .overrideGuard(ACGuard)
      .useValue(acGuard)
      .overrideInterceptor(AclFilterResponseInterceptor)
      .useValue(aclFilterResponseInterceptor)
      .overrideInterceptor(AclValidateRequestInterceptor)
      .useValue(aclValidateRequestInterceptor)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  test("POST /historySendMails", async () => {
    await request(app.getHttpServer())
      .post("/historySendMails")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        sentAt: CREATE_RESULT.sentAt.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      });
  });

  test("GET /historySendMails", async () => {
    await request(app.getHttpServer())
      .get("/historySendMails")
      .expect(HttpStatus.OK)
      .expect([
        {
          ...FIND_MANY_RESULT[0],
          createdAt: FIND_MANY_RESULT[0].createdAt.toISOString(),
          sentAt: FIND_MANY_RESULT[0].sentAt.toISOString(),
          updatedAt: FIND_MANY_RESULT[0].updatedAt.toISOString(),
        },
      ]);
  });

  test("GET /historySendMails/:id non existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/historySendMails"}/${nonExistingId}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No resource was found for {"${"id"}":"${nonExistingId}"}`,
        error: "Not Found",
      });
  });

  test("GET /historySendMails/:id existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/historySendMails"}/${existingId}`)
      .expect(HttpStatus.OK)
      .expect({
        ...FIND_ONE_RESULT,
        createdAt: FIND_ONE_RESULT.createdAt.toISOString(),
        sentAt: FIND_ONE_RESULT.sentAt.toISOString(),
        updatedAt: FIND_ONE_RESULT.updatedAt.toISOString(),
      });
  });

  test("POST /historySendMails existing resource", async () => {
    const agent = request(app.getHttpServer());
    await agent
      .post("/historySendMails")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        sentAt: CREATE_RESULT.sentAt.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      })
      .then(function () {
        agent
          .post("/historySendMails")
          .send(CREATE_INPUT)
          .expect(HttpStatus.CONFLICT)
          .expect({
            statusCode: HttpStatus.CONFLICT,
          });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
