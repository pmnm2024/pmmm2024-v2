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
import { SupportRequestDetailController } from "../supportRequestDetail.controller";
import { SupportRequestDetailService } from "../supportRequestDetail.service";

const nonExistingId = "nonExistingId";
const existingId = "existingId";
const CREATE_INPUT = {
  createdAt: new Date(),
  id: "exampleId",
  quantity: 42,
  supportRequestID: "exampleSupportRequestId",
  unit: "exampleUnit",
  updatedAt: new Date(),
  wareHouseId: "exampleWareHouseId",
  wareHouseName: "exampleWareHouseName",
};
const CREATE_RESULT = {
  createdAt: new Date(),
  id: "exampleId",
  quantity: 42,
  supportRequestID: "exampleSupportRequestId",
  unit: "exampleUnit",
  updatedAt: new Date(),
  wareHouseId: "exampleWareHouseId",
  wareHouseName: "exampleWareHouseName",
};
const FIND_MANY_RESULT = [
  {
    createdAt: new Date(),
    id: "exampleId",
    quantity: 42,
    supportRequestID: "exampleSupportRequestId",
    unit: "exampleUnit",
    updatedAt: new Date(),
    wareHouseId: "exampleWareHouseId",
    wareHouseName: "exampleWareHouseName",
  },
];
const FIND_ONE_RESULT = {
  createdAt: new Date(),
  id: "exampleId",
  quantity: 42,
  supportRequestID: "exampleSupportRequestId",
  unit: "exampleUnit",
  updatedAt: new Date(),
  wareHouseId: "exampleWareHouseId",
  wareHouseName: "exampleWareHouseName",
};

const service = {
  createSupportRequestDetail() {
    return CREATE_RESULT;
  },
  supportRequestDetails: () => FIND_MANY_RESULT,
  supportRequestDetail: ({ where }: { where: { id: string } }) => {
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

describe("SupportRequestDetail", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: SupportRequestDetailService,
          useValue: service,
        },
      ],
      controllers: [SupportRequestDetailController],
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

  test("POST /supportRequestDetails", async () => {
    await request(app.getHttpServer())
      .post("/supportRequestDetails")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      });
  });

  test("GET /supportRequestDetails", async () => {
    await request(app.getHttpServer())
      .get("/supportRequestDetails")
      .expect(HttpStatus.OK)
      .expect([
        {
          ...FIND_MANY_RESULT[0],
          createdAt: FIND_MANY_RESULT[0].createdAt.toISOString(),
          updatedAt: FIND_MANY_RESULT[0].updatedAt.toISOString(),
        },
      ]);
  });

  test("GET /supportRequestDetails/:id non existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/supportRequestDetails"}/${nonExistingId}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No resource was found for {"${"id"}":"${nonExistingId}"}`,
        error: "Not Found",
      });
  });

  test("GET /supportRequestDetails/:id existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/supportRequestDetails"}/${existingId}`)
      .expect(HttpStatus.OK)
      .expect({
        ...FIND_ONE_RESULT,
        createdAt: FIND_ONE_RESULT.createdAt.toISOString(),
        updatedAt: FIND_ONE_RESULT.updatedAt.toISOString(),
      });
  });

  test("POST /supportRequestDetails existing resource", async () => {
    const agent = request(app.getHttpServer());
    await agent
      .post("/supportRequestDetails")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      })
      .then(function () {
        agent
          .post("/supportRequestDetails")
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
