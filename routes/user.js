const User = require("../models/userModel");
async function routes(fastify, options) {
  const createSendToken = (user, reply) => {
    const token = fastify.jwt.sign({ payload: user.id });
    reply.cookie("jwt", token);
    reply.code(200).send({
      status: "success",
      data: user,
      token,
    });
  };

  /**
   * GET USER DATA
   */

  fastify.get(
    "/user",
    {
      preValidation: [fastify.authenticate],
    },
    async (request, reply) => {
      const id = request.user.payload;
      const user = await User.findById(id);

      reply.send(user);
    }
  );

  /**
   * SIGNUP
   */
  fastify.post("/user", async (request, reply) => {
    const { name, password, confirmPassword, email, username } = request.body;
    const user = await User.create({
      name,
      password,
      confirmPassword,
      email,
      username,
    });
    createSendToken(user, reply);
  });

  /**
   * LOGIN
   */

  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password)
      reply.badRequest("Please Enter Username and password");

    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await user.checkPassword(password, user.password)))
      reply.notFound("Invalid Username And Password");
    createSendToken(user, reply);
  });

  /**
   *
   * Forgot Password
   */

  // fastify.post("/forgot-password", async (request, reply) => {
  //   const { mailer } = fastify;
  //   const { email } = request.body;
  //   if (!email) reply.badRequest(`Please Enter ${data}`);

  //   const user = await User.findOne({ email });
  //   if (!user) reply.notFound(`No user with this email`);

  //   mailer.sendMail(
  //     {
  //       to: email,
  //       text: "hello world !",
  //     },
  //     (errors, info) => {
  //       if (errors) {
  //         fastify.log.error(errors);

  //         reply.serviceUnavailable();
  //       }

  //       reply.code(200).send({
  //         status: "ok",
  //         message: "Email successfully sent",
  //       });
  //     }
  //   );
  // });
}

module.exports = routes;
