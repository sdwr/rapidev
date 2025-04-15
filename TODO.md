1. authentication, cookies, sessions
 - client login/create account
 - saves client id in cookie
 - uses client id to get profile info, and when modifying orders

 2. courier login/create account
 - saves courier id in cookie
 - uses courier id to get courier info, and when modifying orders



-- Potential issues

1. order is attached to user profile
- how does this work with multiple user locations?
- attach to user as well/instead?
