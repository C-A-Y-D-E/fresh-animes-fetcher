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

  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password)
      reply.badRequest("Please Enter Username and password");

    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await user.checkPassword(password, user.password)))
      reply.notFound("Invalid Username And Password");
    createSendToken(user, reply);
  });
}

module.exports = routes;
