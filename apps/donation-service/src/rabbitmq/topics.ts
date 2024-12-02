export enum MyMessageBrokerTopics {
  ResetPassword = "reset.password",
  SendMail = "send.mail",
  SendMailFail = "send.mail.fail",
  Donate = "donate",
}
export type AllMessageBrokerTopics = MyMessageBrokerTopics;
