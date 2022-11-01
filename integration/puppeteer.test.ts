/**
 * @jest-environment puppeteer
 */
describe("end 2 end tests", () => {
	jest.setTimeout(10000); // 10 seconds
	const linkToProjects = "#root > header > a:nth-child(3)";
	beforeAll(async () => {
		await page.goto("http://localhost:3000/");
	});

	test('should be titled "React App"', async () => {
		await expect(page.title()).resolves.toMatch("React App");
	});

	test("should navigate to Projects", async () => {
		await page.click(linkToProjects);
		await page.screenshot({ path: "projects.png" });

		const projectHeaderElement = await page.waitForSelector(
			"#root > div > h1"
		);
		const value = await projectHeaderElement?.evaluate(
			(el) => el.textContent
		);
		expect(value).toBe("Projects");
	});

	test("should navigate to Project Detail screen", async () => {
		await page.click(linkToProjects);

		const linkToProject =
			"#root > div > div:nth-child(2) > div:nth-child(3) > div > section > a";

		await page.waitForSelector(linkToProject, {
			visible: true,
		});
		await page.click(linkToProject);

		await page.screenshot({ path: "projectDetail.png" });

		const projectDetailElement = await page.waitForSelector(
			"#root > div > div > h1"
		);
		expect(
			await projectDetailElement?.evaluate((el) => el.textContent)
		).toBe("Project Detail");
	});

	test("should change the project info and save to db", async () => {
		await page.click(linkToProjects);

		const editAAA = 'aria/edit AAA[role="button"]';

		await page.waitForSelector(editAAA, {
			visible: true,
		});
		await page.click(editAAA);

		await page.screenshot({ path: "projectFormOpened.png" });

		const newBudget = 100;
		const newName = "ABB";
		const budgetInput = await page.$("input[name='budget']");
		const nameInput = await page.$("input[name='name']");
		const saveButton = 'aria/Save[role="button"]';

		await budgetInput?.click({ clickCount: 3 });
		await page.keyboard.press("Backspace");
		await budgetInput?.type(String(newBudget));
		await nameInput?.click({ clickCount: 3 });
		await page.keyboard.press("Backspace");
		await nameInput?.type(newName);
		await page.click("#isActive");
		await page.click(saveButton);

		await page.screenshot({ path: "projectFormSaved.png" });

		const screenName = await page.waitForSelector(
			"#root > div > div:nth-child(2) > div:nth-child(1) > div > section > a > h5 > strong",
			{
				visible: true,
			}
		);
		expect(await screenName?.evaluate((el) => el.textContent)).toBe(
			newName
		);
	});

	test("should change the project info back to original and save to db", async () => {
		await page.click(linkToProjects);

		const editABB = 'aria/edit ABB[role="button"]';

		await page.waitForSelector(editABB, {
			visible: true,
		});
		await page.click(editABB);

		await page.screenshot({ path: "projectFormOpenedwithChangedName.png" });

		const oldBudget = 74221;
		const oldName = "AAA";
		const budgetInput = await page.$("input[name='budget']");
		const nameInput = await page.$("input[name='name']");
		const saveButton = 'aria/Save[role="button"]';

		await budgetInput?.click({ clickCount: 3 });
		await page.keyboard.press("Backspace");
		await budgetInput?.type(String(oldBudget));
		await nameInput?.click({ clickCount: 3 });
		await page.keyboard.press("Backspace");
		await nameInput?.type(oldName);
		await page.click("#isActive");
		await page.click(saveButton);
		await page.screenshot({ path: "projectFormSavedWithChangedName.png" });

		const screenName = await page.waitForSelector(
			"#root > div > div:nth-child(2) > div:nth-child(1) > div > section > a > h5 > strong",
			{
				visible: true,
			}
		);
		expect(await screenName?.evaluate((el) => el.textContent)).toBe(
			oldName
		);
	});
});
