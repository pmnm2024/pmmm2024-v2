export enum MyMessageBrokerTopics {
  ResetPassword = "reset.password",
  SendMail = "send.mail",
  SendMailFail = "send.mail.fail",
}
export type AllMessageBrokerTopics = MyMessageBrokerTopics;
