// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

using UnrealBuildTool;
using System.Collections.Generic;

public class DarkSoulsGameTarget : TargetRules
{
	public DarkSoulsGameTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.V2;
		ExtraModuleNames.Add("DarkSoulsGame");
	}
}
