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
import { DonationController } from "../donation.controller";
import { DonationService } from "../donation.service";

const nonExistingId = "nonExistingId";
const existingId = "existingId";
const CREATE_INPUT = {
  accountNumber: "exampleAccountNumber",
  amount: 42.42,
  bank: "exampleBank",
  city: "exampleCity",
  createdAt: new Date(),
  description: "exampleDescription",
  detailAddress: "exampleDetailAddress",
  district: "exampleDistrict",
  email: "exampleEmail",
  fullName: "exampleFullName",
  id: "exampleId",
  phone: "examplePhone",
  supportRequestTypeId: "exampleSupportRequestTypeId",
  supportRequestTypeName: "exampleSupportRequestTypeName",
  updatedAt: new Date(),
  userId: "exampleUserId",
  ward: "exampleWard",
};
const CREATE_RESULT = {
  accountNumber: "exampleAccountNumber",
  amount: 42.42,
  bank: "exampleBank",
  city: "exampleCity",
  createdAt: new Date(),
  description: "exampleDescription",
  detailAddress: "exampleDetailAddress",
  district: "exampleDistrict",
  email: "exampleEmail",
  fullName: "exampleFullName",
  id: "exampleId",
  phone: "examplePhone",
  supportRequestTypeId: "exampleSupportRequestTypeId",
  supportRequestTypeName: "exampleSupportRequestTypeName",
  updatedAt: new Date(),
  userId: "exampleUserId",
  ward: "exampleWard",
};
const FIND_MANY_RESULT = [
  {
    accountNumber: "exampleAccountNumber",
    amount: 42.42,
    bank: "exampleBank",
    city: "exampleCity",
    createdAt: new Date(),
    description: "exampleDescription",
    detailAddress: "exampleDetailAddress",
    district: "exampleDistrict",
    email: "exampleEmail",
    fullName: "exampleFullName",
    id: "exampleId",
    phone: "examplePhone",
    supportRequestTypeId: "exampleSupportRequestTypeId",
    supportRequestTypeName: "exampleSupportRequestTypeName",
    updatedAt: new Date(),
    userId: "exampleUserId",
    ward: "exampleWard",
  },
];
const FIND_ONE_RESULT = {
  accountNumber: "exampleAccountNumber",
  amount: 42.42,
  bank: "exampleBank",
  city: "exampleCity",
  createdAt: new Date(),
  description: "exampleDescription",
  detailAddress: "exampleDetailAddress",
  district: "exampleDistrict",
  email: "exampleEmail",
  fullName: "exampleFullName",
  id: "exampleId",
  phone: "examplePhone",
  supportRequestTypeId: "exampleSupportRequestTypeId",
  supportRequestTypeName: "exampleSupportRequestTypeName",
  updatedAt: new Date(),
  userId: "exampleUserId",
  ward: "exampleWard",
};

const service = {
  createDonation() {
    return CREATE_RESULT;
  },
  donations: () => FIND_MANY_RESULT,
  donation: ({ where }: { where: { id: string } }) => {
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

describe("Donation", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DonationService,
          useValue: service,
        },
      ],
      controllers: [DonationController],
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

  test("POST /donations", async () => {
    await request(app.getHttpServer())
      .post("/donations")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      });
  });

  test("GET /donations", async () => {
    await request(app.getHttpServer())
      .get("/donations")
      .expect(HttpStatus.OK)
      .expect([
        {
          ...FIND_MANY_RESULT[0],
          createdAt: FIND_MANY_RESULT[0].createdAt.toISOString(),
          updatedAt: FIND_MANY_RESULT[0].updatedAt.toISOString(),
        },
      ]);
  });

  test("GET /donations/:id non existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/donations"}/${nonExistingId}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No resource was found for {"${"id"}":"${nonExistingId}"}`,
        error: "Not Found",
      });
  });

  test("GET /donations/:id existing", async () => {
    await request(app.getHttpServer())
      .get(`${"/donations"}/${existingId}`)
      .expect(HttpStatus.OK)
      .expect({
        ...FIND_ONE_RESULT,
        createdAt: FIND_ONE_RESULT.createdAt.toISOString(),
        updatedAt: FIND_ONE_RESULT.updatedAt.toISOString(),
      });
  });

  test("POST /donations existing resource", async () => {
    const agent = request(app.getHttpServer());
    await agent
      .post("/donations")
      .send(CREATE_INPUT)
      .expect(HttpStatus.CREATED)
      .expect({
        ...CREATE_RESULT,
        createdAt: CREATE_RESULT.createdAt.toISOString(),
        updatedAt: CREATE_RESULT.updatedAt.toISOString(),
      })
      .then(function () {
        agent
          .post("/donations")
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
